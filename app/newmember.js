'use strict';
var m = require('mithril');
var css = require('./style.styl');
var mdc = require('material-components-web');
var _ = function(t) { return t; } // Mockup for translation
require('@material/button/dist/mdc.button.css');
var MDCTextField = require('@material/textfield');
require('@material/textfield/dist/mdc.textfield.css');
require('@material/ripple');
require('@material/ripple/dist/mdc.ripple.css');
require('@material/floating-label');
require('@material/floating-label/dist/mdc.floating-label.css');
require('font-awesome/css/font-awesome.css');

const ONLINE = 'ONLINE';
const OFFLINE = 'OFFLINE';


m.prop = require('mithril/stream');

var apibase = 'http://testing.somenergia.coop:5001'

function requestSom(uri) {
	var abortable = undefined;
	var promise = new Promise(function(resolve, reject) {
		m.request({
			method: 'GET',
			url: apibase+uri,
			withCredentials: true,
			config: function(xhr) {
				abortable = xhr;
			},
		})
		.then(function(response) {
			console.log('response', response);

			if (response.status === ONLINE) {
				resolve(response);
			} else if (response.status === OFFLINE) {
				reject(_('The backend server is offline'));
			} else {
				reject(_('Unexpected response'));
			}
		})
		.catch(function(reason) {
			console.log(_('Request failed'), apibase+uri, reason);
			reject(reason.message || _('Request failed'));
		})
		;
	});
	promise.abort = function() {
		console.log("Aborting request ",apibase+uri);
		abortable.abort()
	};
	return promise;
};


var ValidatedField = {
	oninit: function(vnode) {
		//console.debug(vnode.attrs.id, ': init ', vnode.state, vnode.attrs);
		vnode.state.value = vnode.attrs.value;
		vnode.state.isvalid = vnode.attrs.checkurl===undefined;
		vnode.state.errormessage = undefined;
		vnode.state._lastPromise = undefined;
		//console.debug(vnode.attrs.id, ': after init ', vnode.state, vnode.attrs);
	},
	view: function (vnode) {
		const statusIcons = {
			empty:  '',
			missing:'.fa.fa-asterisk.red',
			ok:     '.fa.fa-check.green',
			ko:     '.fa.fa-exclamation-circle.red',
			wait:   '.fa.fa-refresh.fa-spin.orange',
		};
		const help_id = vnode.attrs.id+'_help';
		const error_id = vnode.attrs.id+'_error';
		//console.debug(vnode.attrs.id, ': Updating view ', vnode.state, vnode.attrs);

		var iconState = (vnode.state.value===undefined)? (vnode.attrs.required!==undefined?'missing':'empty') : (
			vnode.state.isvalid===undefined?'wait':vnode.state.isvalid===false?'ko':'ok');
		var statusIcon = statusIcons[iconState] || '';

		function validateInput(ev) {
			//console.debug(vnode.attrs.id, ' oninput',ev);

			function fielderror(message) {
				//console.debug(vnode.attrs.id, ' rejecting ', vnode.state);
				vnode.dom.firstChild.MDCTextField.valid = false;
				vnode.state.isvalid = false;
				vnode.state.errormessage = message;
				ev.target.setCustomValidity(message);
				//console.debug(vnode.attrs.id, ' rejected ', vnode.state);
			}
			function acceptValue(newValue) {
				//console.debug(vnode.attrs.id, "Accepting:", newValue);
				vnode.dom.firstChild.MDCTextField.valid = true;
				vnode.state.isvalid = true;
				vnode.state.errormessage = undefined;
				ev.target.setCustomValidity(undefined);
				vnode.attrs.onChange(newValue); 
				//console.debug(vnode.attrs.id, "Accepted:", vnode.attrs);
			}
			function waitValue(newValue) {
				vnode.dom.firstChild.MDCTextField.valid = true;
				ev.target.setCustomValidity(undefined);
				vnode.state.value = newValue;
				vnode.state.isvalid = undefined; // status checking
				vnode.state.errormessage = undefined;
			}

			var newValue = ev.target.value;
			if (newValue === '') { newValue = undefined; }
			waitValue(newValue);
			if (newValue === undefined) {
				if (vnode.attrs.required !== undefined) {
					return fielderror(_('Required'));
				}
				return acceptValue(newValue);
			}
			if (vnode.attrs.checkurl === undefined) {
				return acceptValue(newValue); 
			}
			if (vnode.state._lastPromise!==undefined) {
				vnode.state._lastPromise.abort();
			}
			// TODO: abortar darrera promesa
			var promise = requestSom(vnode.attrs.checkurl+newValue);
			vnode.state._lastPromise=promise;
			promise.value = newValue;
			promise.then(function(result) {
				if (promise.value != vnode.state.value) {
					console.log('Antigua request '+promise.value);
					return; // value changed while waiting, ignore
				}
				if (result.state === false) {
					fielderror(vnode.attrs.defaulterror || _('Invalid value'));
				}
				else {
					fielderror(undefined);
					acceptValue(newValue); 
				}
				if (result.data !== undefined) {
					vnode.state.data = result.data;
					if (result.data.invalid_fields !== undefined) {
						fielderror(result.data.invalid_fields[0].error);
					}
				}
			}).catch(function(reason) {
				fielderror(reason || _('Unknown'));
			});
			//console.debug('oninput end',vnode.attrs);
		};

		return m('.mdc-form-field', [
			m(''
				+'.mdc-text-field'
				+(vnode.attrs.fullwidth?'.mdc-text-field--fullwidth':'')
				+'.mdc-text-field--with-trailing-icon'
				+(vnode.attrs.fullwidth?'':'.mdc-text-field--box')
				+(vnode.attrs.disabled?'mdc-text-field--disabled':'')
			,{
				'data-mdc-auto-init': 'MDCTextField',
			},[
				m('input[type=text]'+
					'.mdc-text-field__input'+
					'',
				{
					pattern: vnode.attrs.pattern,
					id: vnode.attrs.id,
					value: vnode.state.value,
					disabled: vnode.attrs.disabled,
					required: vnode.attrs.required,
					onchange: validateInput,
					oninput: validateInput,
					'aria-controls': help_id,
					'aria-describedby': help_id,
				}, [
				]),
				vnode.attrs.fullwidth?'':m('label'
					+'.mdc-floating-label',
					{'for': vnode.attrs.id}, [
					vnode.attrs.label,
				]),
				m('.mdc-line-ripple'),
				vnode.attrs.fullwidth?[]:
					m('.mdc-text-field__icon.red', {
						}, [
							m('i'+statusIcon,''),
						]),
			]),
			vnode.state.errormessage?
				m('.mdc-text-field-helper-text'+
					'.mdc-text-field-helper-text--validation-msg'+
					'', {
					id: error_id,
					'aria-hidden': true,
					},
					vnode.state.errormessage
				):
			vnode.attrs.help?
				m('.mdc-text-field-helper-text'+
					'.mdc-text-field-helper-text--persistent'+
					'', {
					id: help_id,
					'aria-hidden': true,
					},
					vnode.attrs.help
				):'',
		]);
	},
};

var Persona = {
	field: undefined,
	name: undefined,
	nif: undefined,
};

var Form = {
	oncreate: function(vnode) {
		//console.debug('auto init', vnode);
		mdc.autoInit();
	},
	view: function() {
		return m('.form.span',
		[
			m(ValidatedField, {
				id: 'afield',
				label: _('Field label'),
				help: _('Field Help'),
				icon: '.fa-spinner.fa-spin',
				value: Persona.field,
				onChange: function(value) {
					Persona.field = value;
				},
			}),
			m(ValidatedField, {
				id: 'nif',
				label: _('NIF/DNI'),
				pattern: /[0-9A-Za-z]+/,
				defaulterror: _('Invalid VAT'),
				checkurl: '/check/vat/',
				help: _('Tax ID'),
				value: Persona.nif,
				onChange: function(value) {
					Persona.nif = value;
				},
			}),
			m(ValidatedField, {
				id: 'name',
				label: _('Name'),
				required: true,
				help: _('Ayuda'),
				value: Persona.name,
				onChange: function(value) {
					Persona.name = value;
				},
			}),
			m('button.mdc-button', {
				disabled: Persona.error,
				tabindex: 0,
				},  _("submit")),

			m('', Persona.name, '(', Persona.nif, ')'),
		]);
	},
};


window.onload = function() {
	var element = document.getElementById("mithril-target");
	m.mount(element, Form);
};
// vim: noet ts=4 sw=4
