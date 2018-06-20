'use strict';
var m = require('mithril');
var _ = require('./translate');
var requestSom = require('./somapi').requestSom
var MDCTextField = require('@material/textfield');
require('@material/textfield/dist/mdc.textfield.css');
require('@material/ripple');
require('@material/ripple/dist/mdc.ripple.css');
require('@material/floating-label');
require('@material/floating-label/dist/mdc.floating-label.css');

var ValidatedInput = {
	oninit: function(vnode) {
		vnode.state.value = vnode.attrs.value;
		vnode.state.isvalid = vnode.attrs.checkurl===undefined;
		vnode.state.errormessage = undefined;
		vnode.state._lastPromise = undefined;
	},
	oncreate: function(vnode) {
		var mdcinput = vnode.dom.querySelector('.mdc-text-field');
		this.mdcinstance = new MDCTextField.MDCTextField(mdcinput);
	},
	view: function (vnode) {
		const help_id = vnode.attrs.id+'_help';
		const statusIcons = {
			empty:  '',
			missing:'.fa.fa-asterisk.red',
			ok:     '.fa.fa-check.green',
			ko:     '.fa.fa-exclamation-triangle.red',
			wait:   '.fa.fa-refresh.fa-spin.orange',
		};
		const statusColors = {
			empty:  '',
			missing:'.red',
			ok:     '.green',
			ko:     '.red',
			wait:   '.orange',
		};
		const statusMessages = {
			empty:  '',
			missing:_('Required'),
			ok:     vnode.attrs.checkurl?_('Correct'):'',
			ko:     _('Invalid'),
			wait:   _('Checking...'),
		};

		var iconState = (vnode.state.value===undefined)? (vnode.attrs.required!==undefined?'missing':'empty') : (
			vnode.state.isvalid===undefined?'wait':vnode.state.isvalid===false?'ko':'ok');

		var statusIcon = statusIcons[iconState] || '';
		var statusColor = statusColors[iconState] || '';
		var statusMessage = statusMessages[iconState] || '';

		function validateInput(ev) {

			var newValue = ev.target.value;
			function fielderror(message) {
				vnode.state.mdcinstance.valid = false;
				vnode.state.isvalid = false;
				vnode.state.errormessage = message;
				ev.target.setCustomValidity(message);
				ev.target.value = newValue||'';
			}
			function acceptValue(newValue) {
				vnode.state.mdcinstance.valid = true;
				vnode.state.isvalid = true;
				vnode.state.errormessage = undefined;
				ev.target.setCustomValidity(undefined);
				vnode.attrs.onChange && vnode.attrs.onChange(newValue);
			}
			function waitValue(newValue) {
				vnode.state.mdcinstance.valid = true;
				ev.target.setCustomValidity(undefined);
				vnode.state.value = newValue;
				vnode.state.isvalid = undefined; // status checking
				vnode.state.errormessage = undefined;
			}

			if (vnode.attrs.filter) {
				newValue = vnode.attrs.filter(newValue);
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
				fielderror(reason || _('Unknown'));
			});
		};

		return m('.mdc-form-field', [
			m(''
				+'.mdc-text-field'
				+(vnode.attrs.fullwidth?'.mdc-text-field--fullwidth':'')
				+'.mdc-text-field--with-trailing-icon'
				+(vnode.attrs.fullwidth?'':'.mdc-text-field--box')
				+(vnode.attrs.disabled?'mdc-text-field--disabled':'')
			,{
				style: { width: '100%'},
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
			m('.mdc-text-field-helper-text'+
				'.mdc-text-field-helper-text--persistent'+
				'.mdc-text-field-helper-text--validation-msg'+
				statusColor+
				'', {
				id: help_id,
				'aria-hidden': true,
				},
				vnode.state.errormessage || statusMessage || vnode.attrs.help
			),
		]);
	},
};


module.exports = ValidatedInput

// vim: noet ts=4 sw=4
