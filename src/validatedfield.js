'use strict';
var m = require('mithril');
var _ = require('./translate');
var requestSom = require('./somapi').requestSom
var MDCTextField = require('@material/textfield');
require('@material/textfield/dist/mdc.textfield.css');
var TextField = require('./mdc/textfield');

var ValidatedField = {
	oninit: function(vnode) {
		vnode.state.fieldData = vnode.attrs.fieldData || {};
		vnode.state.fieldData.value = vnode.attrs.value;
		vnode.state.fieldData.isvalid = vnode.attrs.checkurl===undefined;
		vnode.state.fieldData.errormessage = undefined;
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

		var state = (vnode.state.fieldData.value===undefined)? (vnode.attrs.required!==undefined?'missing':'empty') : (
			vnode.state.fieldData.isvalid===undefined?'wait':vnode.state.fieldData.isvalid===false?'ko':'ok');

		var statusIcon = statusIcons[state] || undefined;
		var statusMessage = statusMessages[state] || '';

		function validateInput(ev) {
			var newValue = ev.target.value;
			function fielderror(message) {
				vnode.state.fieldData.isvalid = false;
				vnode.state.fieldData.errormessage = message;
				ev.target.setCustomValidity(message);
				ev.target.value = newValue||'';
				vnode.attrs.onvalidated && vnode.attrs.onvalidated();
			}
			function acceptValue(newValue) {
				vnode.state.fieldData.isvalid = true;
				vnode.state.fieldData.errormessage = undefined;
				var data = vnode.state.fieldData.data;
				ev.target.setCustomValidity('');
				vnode.attrs.onvalidated && vnode.attrs.onvalidated(newValue, data);
			}
			function waitValue(newValue) {
				vnode.state.fieldData.value = newValue;
				vnode.state.fieldData.isvalid = undefined; // status checking
				vnode.state.fieldData.errormessage = undefined;
				ev.target.setCustomValidity('');
				vnode.attrs.onvalidated && vnode.attrs.onvalidated();
			}
			if (newValue === '') { newValue = undefined; }
			if (newValue === undefined) {
				if (vnode.attrs.required !== undefined) {
					return fielderror(_('Required'));
				}
				return acceptValue(newValue||'');
			}
			// Synchronous validation (via provided function)
			if (vnode.attrs.validator!==undefined) {
				var error = vnode.attrs.validator(newValue);
				if (error) { return fielderror(error); }
			}
			if (vnode.attrs.checkurl === undefined) {
				return acceptValue(newValue||''); 
			}
			// Asynchronous validation (via API)
			waitValue(newValue);
			if (vnode.state._lastPromise!==undefined) {
				vnode.state._lastPromise.abort();
			}
			var promise = requestSom(vnode.attrs.checkurl+newValue);
			vnode.state._lastPromise=promise;
			promise.value = newValue;
			promise.then(function(result) {
				if (promise.value != vnode.state.fieldData.value) {
					return; // value changed while waiting, ignore
				}
				if (result.state === false) {
					// Validation Error
					var defaultError = vnode.attrs.defaulterror || _('Invalid value');
					if (result.data === undefined) {
						return fielderror(defaultError);
					}
					vnode.state.fieldData.errorData = result.data;

					if (result.data.invalid_fields === undefined) {
						return fielderror(defaultError);
					}
					return fielderror(result.data.invalid_fields[0].error);
				}
				// Validated
				if (result.data !== undefined) {
					vnode.state.fieldData.data = result.data;
				}
				acceptValue(newValue, vnode.state.fieldData.data); 

			}).catch(function(reason) {
				fielderror(reason || _('Unknown Error'));
			});
		};
		return m(TextField, Object.assign({
			// defaults
			}, vnode.attrs, {
			// overrrides
			oninput: validateInput,
			value: vnode.state.value,
			faicon: statusIcon,
			errormessage: vnode.state.errormessage,
			help: statusMessage || vnode.attrs.help,
		}));
	},
};

const Example = {};
Example.Persona = {
	iban: {},
	vat: {},
	name: {},
	cups: {},
};

Example.view = function(vn) {
	const Layout = require('./mdc/layout');
	return m(Layout,
		m(Layout.Row, m(Layout.Cell, m('h2', 'Validated input'))),
		m(Layout.Row, [
		m(Layout.Cell, {span:7},
			m(ValidatedField, {
				id: 'iban',
				label: _('IBAN (compte bancari)'),
				help: _('Un com aquest: ES77 1234 1234 1612 3456 7890'),
				defaulterror: _('Invalid IBAN'),
				required: true,
				maxlength: 29,
				inputfilter: function(value) {
					if (!value) return value;
					// Separate it in 4 chunks
					value=value.toUpperCase();
					value=value.split(' ').join('');
					value=value.match(/.{1,4}/g).join(' ');
					return value
				},
				checkurl: '/check/iban/',
				fieldData: Example.Persona.iban,
			})
		),
		m(Layout.Cell, {span:5},
			m(ValidatedField, {
				label: _('NIF'),
				required: true,
				id: 'vat',
				inputfilter: /[a-zA-Z0-9]{0,9}/,
				pattern: "[0-9]{8}[a-zA-Z]",
				checkurl: '/check/vat/',
				fieldData: Example.Persona.vat,
				help: _('NIF/DNI/NIE'),
			})
		),
		m(Layout.Cell, {span:12}, [
			m(ValidatedField, {
				id: 'cups',
				label: _('CUPS'),
				help: _('"ES" followed by 16 numbers and two check letters'),
				checkurl: '/check/cups/',
				inputfilter: function(value) {
					return value.toUpperCase();
				},
				fieldData: ValidatedField.Example.Persona.cups,
			}),
			m(ValidatedField, {
				id: 'afield',
				label: _('Field label'),
				help: _('Field Help'),
				faicon: 'spinner.fa-spin',
				fieldData: ValidatedField.Example.Persona.field,
			}),
			m(ValidatedField, {
				id: 'name',
				label: _('Name'),
				required: true,
				help: _('Ayuda'),
				fieldData: ValidatedField.Example.Persona.name,
			}),
			m('tt', JSON.stringify(ValidatedField.Example.Persona,null,2)),
		]),
	]));
};

ValidatedField.Example = Example;
module.exports = ValidatedField

// vim: noet ts=4 sw=4
