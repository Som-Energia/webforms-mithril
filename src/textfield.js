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

var MDCTextFieldIcon = require('@material/textfield/icon').MDCTextFieldIcon;
require('@material/notched-outline/dist/mdc.notched-outline.min.css');
var MDCNotchedOutline = require('@material/notched-outline').MDCNotchedOutline;


var TextField = {
	oninit: function(vn) {
		vn.state.value = vn.attrs.value;
		vn.state.isvalid = vn.attrs.checkurl===undefined;
		vn.state.errormessage = undefined;
		vn.state._lastPromise = undefined;
	},
	oncreate: function(vn) {
		var mdcinput = vn.dom.querySelector('.mdc-text-field');
		this.mdcinstance = new MDCTextField.MDCTextField(mdcinput);
		var inputIcon = vn.dom.querySelector('.mdc-text-field__icon');
		//this.mdcIcon = new MDCTextFieldIcon(vn.dom.querySelector('.mdc-text-field-icon'));
		const notchedOutline = vn.dom.querySelector('.mdc-notched-outline');
		console.debug(notchedOutline);
		this.mdcOutline = new MDCNotchedOutline(notchedOutline);
	},
	view: function (vn) {
		const help_id = vn.attrs.id+'_help';

		return m('.mdc-form-field', [
			m(''
				+'.mdc-text-field'
				+(vn.attrs.fullwidth?'.mdc-text-field--fullwidth':'')
				+(vn.attrs.boxed?'.mdc-text-field--box':'')
				+(vn.attrs.outlined?'':'.mdc-text-field--outlined')

				+(vn.attrs.faicon?'.mdc-text-field--with-trailing-icon':'')
				+(vn.attrs.leadingfaicon?'.mdc-text-field--with-leading-icon':'')
				+(vn.attrs.disabled?'mdc-text-field--disabled':'')
				+(vn.attrs.dense?'mdc-text-field--dense':'')
			,{
				style: { width: '100%'},
			},[
				(vn.attrs.leadingfaicon ? m('i.mdc-text-field__icon.fa.fa-'+vn.attrs.leadingfaicon):''),
				m('input'+
					'.mdc-text-field__input'+
					'',
				{
					type: vn.attrs.type? vn.attrs.type:'text',
					pattern: vn.attrs.pattern,
					id: vn.attrs.id,
					value: vn.state.value,
					disabled: vn.attrs.disabled,
					required: vn.attrs.required,
					placeholder: vn.attrs.fullwidth?_(vn.attrs.label):undefined,
					'aria-label': vn.attrs.fullwidth?_(vn.attrs.label):undefined,
					'aria-controls': help_id,
					'aria-describedby': help_id,
				}, [
				]),
				vn.attrs.fullwidth||vn.attrs.outlined?'':m('label'
					+'.mdc-floating-label',
					{'for': vn.attrs.id}, [
					vn.attrs.label,
				]),
				(vn.attrs.outlined||vn? '': m('.mdc-line-ripple')),
				(vn.attrs.outlined? m('.mdc-notched-outline',
					m('svg', m('path.mdc-notched-outline__path'))):''),
				(vn.attrs.outlined? m('.mdc-notched-outline__idle'):''),
				(vn.attrs.faicon ? m('i.mdc-text-field__icon.fa.fa-'+vn.attrs.faicon):''),
			]),
			m('.mdc-text-field-helper-text'+
				'.mdc-text-field-helper-text--persistent'+
				'.mdc-text-field-helper-text--validation-msg'+
				'', {
				id: help_id,
				'aria-hidden': true,
				},
				vn.attrs.help
			),
		]);
	},
};

TextField.Example = {};
TextField.Example.view = function(vn) {
	const Layout = require('./layout');
	return m(Layout, ['','boxed','outlined','fullwidth'].map(function(type) {
		return m(Layout.Row, [
			{
				id: 'mytextfield',
				label: _('My label'),
			},
			{
				id: 'icon',
				label: _('With icon'),
				faicon: 'asterisk',
			},
			{
				id: 'coloricon',
				label: _('With color icon'),
				faicon: 'asterisk.red',
			},
			{
				id: 'leadicon',
				label: _('With leading icon'),
				leadingfaicon: 'phone',
			},
			{
				id: 'bothicons',
				label: _('With leading and trailing icon'),
				leadingfaicon: 'phone.green',
				faicon: 'exclamation.red',
			},
			{
				id: 'helpfull',
				label: _('With helper text'),
				help: _('This is a helper text'),
			},
		].map(function(v) {
			var attrs = Object.assign({}, v);
			if (type) {
				attrs[type] = true;
				attrs.id+=type;
				attrs.label+= " "+type
			}
			return m(Layout.Cell, {span:4}, m(TextField, attrs));
		}));
	}));
};


module.exports = TextField

// vim: noet ts=4 sw=4
