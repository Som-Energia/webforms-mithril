'use strict';
var m = require('mithril');
var _ = require('./translate');
var requestSom = require('./somapi').requestSom
var MDCTextField = require('@material/textfield');
require('@material/textfield/dist/mdc.textfield.css');
var TextField = require('./mdc/textfield');

var ValidatedInput = {
	oninit: function(vnode) {
		vnode.state.value = vnode.attrs.value;
		vnode.state.isvalid = vnode.attrs.checkurl===undefined;
		vnode.state.errormessage = undefined;
		vnode.state._lastPromise = undefined;
	},
	oncreate: function(vnode) {
		//var mdcinput = vnode.dom.querySelector('.mdc-text-field');
		//this.mdcinstance = new MDCTextField.MDCTextField(mdcinput);
	},
	view: function (vnode) {
		const help_id = vnode.attrs.id+'_help';
		const statusIcons = {
			empty:  'blank',
			missing:'blank',//'asterisk.red',
			ok:     'check.green',
			ko:     'exclamation-triangle.red',
			wait:   'refresh.fa-spin.orange',
		};
		const statusMessages = {
			empty:  '',
			//missing:_('Required'),
			//ok:     vnode.attrs.checkurl?_('Correct'):'',
			//ko:     _('Invalid'),
			wait:   _('Checking...'),
		};

		var state = (vnode.state.value===undefined)? (vnode.attrs.required!==undefined?'missing':'empty') : (
			vnode.state.isvalid===undefined?'wait':vnode.state.isvalid===false?'ko':'ok');

		var statusIcon = statusIcons[state] || undefined;
		var statusMessage = statusMessages[state] || '';

		function validateInput(ev) {
			var newValue = ev.target.value;
			function fielderror(message) {
				//vnode.state.mdcinstance.valid = false;
				vnode.state.isvalid = false;
				vnode.state.errormessage = message;
				ev.target.setCustomValidity(message);
				ev.target.value = newValue||'';
			}
			function acceptValue(newValue) {
				//vnode.state.mdcinstance.valid = true;
				vnode.state.isvalid = true;
				vnode.state.errormessage = undefined;
				ev.target.setCustomValidity('Checking...');
				console.log('accepting', newValue);
				vnode.attrs.onvalidated && vnode.attrs.onvalidated(newValue);
			}
			function waitValue(newValue) {
				//vnode.state.mdcinstance.valid = true;
				ev.target.setCustomValidity('');
				vnode.state.value = newValue;
				vnode.state.isvalid = undefined; // status checking
				vnode.state.errormessage = undefined;
			}
			if (newValue === '') { newValue = undefined; }
			waitValue(newValue);
			if (newValue === undefined) {
				if (vnode.attrs.required !== undefined) {
					return fielderror(_('Required'));
				}
				return acceptValue(newValue||'');
			}
			if (vnode.attrs.checkurl === undefined) {
				return acceptValue(newValue||''); 
			}
			if (vnode.state._lastPromise!==undefined) {
				vnode.state._lastPromise.abort();
			}
			var promise = requestSom(vnode.attrs.checkurl+newValue);
			vnode.state._lastPromise=promise;
			promise.value = newValue;
			promise.then(function(result) {
				if (promise.value != vnode.state.value) {
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
				fielderror(reason || _('Unknown Error'));
			});
		};
		if (vnode.attrs.id==='vat') {
			console.log('errormessage', vnode.state.errormessage);
			console.log('statusMessage', statusMessage);
			console.log('help', vnode.attrs.help);
		}
		return m(TextField, Object.assign({
			// defaults
			}, vnode.attrs, {
			// overrrides
			onchange: validateInput,
			oninput: validateInput,
			value: vnode.state.value,
			valid: vnode.state.isvalid,
			faicon: statusIcon,
			errormessage: vnode.state.errormessage,
			help: statusMessage || vnode.attrs.help,
		}));
	},
};

const Example = {};
Example.Persona = {
	field: undefined,
	name: undefined,
	nif: undefined,
	nifValidation: {},
};

Example.view = function(vn) {
	const Layout = require('./mdc/layout');
	return m(Layout,
		m(Layout.Row, m(Layout.Cell, m('h2', 'Validated input'))),
		m(Layout.Row, [
		m(Layout.Cell, {span:7},
			m(ValidatedInput, {
				id: 'iban',
				label: _('IBAN (compte bancari)'),
				help: _('El codi internacional de la compte corrent'),
				defaulterror: _('Invalid IBAN'),
				required: true,
				maxlength: 29,
				inputfilter: function(value) {
					if (!value) return value;
					// Separate it in 4 chunks
					value=value.toUpperCase()
					value=value.split(' ').join('');
					value=value.match(/.{1,4}/g).join(' ')
					return value
				},
				checkurl: '/check/iban/',
				value: ValidatedInput.Example.Persona.iban,
				onvalidated: function(value) {
					ValidatedInput.Example.Persona.iban = value;
				},
			})
		),
		m(Layout.Cell, {span:5},
			m(ValidatedInput, {
				label: _('NIF'),
				required: true,
				id: 'vat',
				inputfilter: /[a-zA-Z0-9]{0,9}/,
				pattern: "[0-9]{8}[a-zA-Z]",
				checkurl: '/check/vat/',
				value: ValidatedInput.Example.Persona.vat,
				onvalidated: function(value) {
					ValidatedInput.Example.Persona.vat = value;
				},
				help: _('NIF/DNI/NIE'),
			})
		),
		m(Layout.Cell, {span:12}, [
			m(ValidatedInput, {
				id: 'afield',
				label: _('Field label'),
				help: _('Field Help'),
				icon: '.fa-spinner.fa-spin',
				value: ValidatedInput.Example.Persona.field,
				onvalidated: function(value) {
					ValidatedInput.Example.Persona.field = value;
				},
			}),
			m(ValidatedInput, {
				id: 'nif',
				label: _('NIF/DNI'),
				pattern: /[0-9A-Za-z]+/,
				defaulterror: _('Invalid VAT'),
				checkurl: '/check/vat/',
				help: _('Tax ID'),
				value: ValidatedInput.Example.Persona.nif,
				onvalidated: function(value) {
					ValidatedInput.Example.Persona.nif = value;
				},
			}),
			m(ValidatedInput, {
				id: 'name',
				label: _('Name'),
				required: true,
				help: _('Ayuda'),
				value: ValidatedInput.Example.Persona.name,
				onvalidated: function(value) {
					ValidatedInput.Example.Persona.name = value;
				},
			}),
			m('', ValidatedInput.Example.Persona.name, '(', ValidatedInput.Example.Persona.nif, ')'),
		]),
	]));
};

ValidatedInput.Example = Example;
module.exports = ValidatedInput

// vim: noet ts=4 sw=4
