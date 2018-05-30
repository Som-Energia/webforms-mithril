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
	var promise = new Promise(function(resolve, reject) {
		m.request({
			method: 'GET',
			url: apibase+uri,
			withCredentials: true,
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
	return promise;
};


var ValidatedField = {
	oncreate: function(vnode) {
	},
	view: function (vnode) {
//		var attrs = Object.assign({}, vnode.attrs);
		var attrs = vnode.attrs;
		var state = vnode.state;
		attrs.help_id = attrs.id+'_help';
		attrs.error_id = attrs.id+'_error';
		return m('.mdc-form-field', [
			m('.mdc-text-field'+
				'', {
					'data-mdc-auto-init': 'MDCTextField',
				},[
				m('input[type=text]'+
					'.mdc-text-field__input'+
					(attrs.icon?'.mdc-text-field--with-trailing-icon':'')+
					'',
				{
					id: attrs.id,
					value: attrs.value,
					disabled: attrs.disabled,
					required: attrs.required,
					oninput: function(ev) {
						console.debug('oninput',ev);

						function fielderror(message) {
							console.debug(vnode);
							vnode.dom.firstChild.MDCTextField.valid = message===undefined;
							console.debug('Field error before', message);
							vnode.state.isvalid = (message===undefined);
							vnode.state.errormessage = message;
							ev.target.setCustomValidity(message);
							console.debug('Field error after', state.errormessage);
						}

						fielderror(undefined);
                        var newValue = ev.target.value;
                        if (newValue === '') { newValue = undefined; }
						vnode.attrs.value = newValue;
						if (newValue === undefined) {
							if (attrs.required !== undefined) {
								fielderror(_('Required'));
							}
							return attrs.onChange(newValue); 
						}
						if (attrs.checkurl === undefined) {
							return attrs.onChange(newValue); 
						}
						vnode.state.isvalid = undefined; // status: checking
						// TODO: abortar darrera promesa
						var promise = requestSom(attrs.checkurl+newValue);
						promise.value = newValue;
						promise.then(function(result) {
							if (promise.value != vnode.attrs.value) {
								return; // value changed while waiting
							}
							console.debug(result.state);
							if (result.state === false) {
								fielderror(attrs.defaulterror || _('Invalid value'));
							}
							else {
								attrs.onChange(newValue); 
								fielderror(undefined);
							}
							if (result.data === undefined) {
								return; // No especial info
							}
							vnode.state.data = result.data;
							if (result.data.invalid_fields !== undefined) {
								fielderror(result.data.invalid_fields[0].error);
							}
						}).catch(function(reason) {
							fielderror(reason || _('Unknown'));
						});
						console.debug('oninput end',vnode.attrs);
					},
					'aria-controls': attrs.help_id,
					'aria-describedby': attrs.help_id,
				}),

				m('label.mdc-floating-label',
					{'for': vnode.attrs.id}, [
					vnode.attrs.label,
				]),
				attrs.icon?
					m('.mdc-text-field__icon', {
						//tabindex: 0,
						//role: 'button',
						}, [
							m('i.fa'+attrs.icon,''),
						]):[],
				m('.mdc-line-ripple'),
			]),
			state.errormessage?
				m('.mdc-text-field-helper-text'+
					'.mdc-text-field-helper-text--persistent'+
					'.mdc-text-field-helper-text--validation-msg'+
					'', {
					id: attrs.error_id,
					'aria-hidden': true,
					},
					state.errormessage
				):'',
			attrs.help?
				m('.mdc-text-field-helper-text'+
					'.mdc-text-field-helper-text--persistent'+
					'', {
					id: attrs.help_id,
					'aria-hidden': true,
					},
					attrs.help
				):'',
		]);
	},
};

var Persona = {
	field: undefined,
	name: 'perico',
	nif: undefined,
};

var Form = {
	oncreate: function(vnode) {
		console.debug('auto init', vnode);
		mdc.autoInit();
	},
	view: function() {
		return m('.form.span',
		[
			m(ValidatedField, {
				id: 'fieldid',
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
				defaulterror: _('Bad VAT'),
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
			m('.mdc-button', {tabindex:0,role:'button'},  _("hello")),

			m('', Persona.name, '(', Persona.nif, ')'),
		]);
	},
};


window.onload = function() {
	var element = document.getElementById("mithril-target");
	m.mount(element, Form);
};
// vim: noet ts=4 sw=4
