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
	oncreate: function(vn) {
		var mdcinput = vn.dom.querySelector('.mdc-text-field');
		this.mdcinstance = new MDCTextField.MDCTextField(mdcinput);
		//var inputIcon = vn.dom.querySelector('.mdc-text-field__icon');
		//this.mdcIcon = new MDCTextFieldIcon(vn.dom.querySelector('.mdc-text-field-icon'));
		//const notchedOutline = vn.dom.querySelector('.mdc-notched-outline');
		//this.mdcOutline = new MDCNotchedOutline(notchedOutline);
	},
	view: function (vn) {
		var attrs = Object.assign({}, vn.attrs);
		// Remove the custom attributes no to be applied to the native input
		function pop(o,k) { var r=o[k]; if (r!==undefined) { delete o[k];} return r; }
		const fullwidth = pop(attrs, 'fullwidth');
		const boxed = pop(attrs, 'boxed');
		const outlined = pop(attrs, 'outlined');
		const dense = pop(attrs, 'dense');
		const disabled = pop(attrs, 'disabled');
		const help = pop(attrs, 'help');
		const faicon = pop(attrs, 'faicon');
		const leadingfaicon = pop(attrs, 'leadingfaicon');
		const help_id = vn.attrs.id+'_help';
		const nativeattrs = Object.assign({
			type: 'text',
			placeholder: fullwidth?_(vn.attrs.label):undefined,
			'aria-label': fullwidth?_(vn.attrs.label):undefined,
			'aria-controls': help_id,
			'aria-describedby': help_id,
			}, attrs);

		return m('.mdc-form-field', [
			m(''
				+'.mdc-text-field'
				+(fullwidth?'.mdc-text-field--fullwidth':'')
				+(boxed?'.mdc-text-field--box':'')
				+(outlined?'.mdc-text-field--outlined':'')

				+(faicon?'.mdc-text-field--with-trailing-icon':'')
				+(leadingfaicon?'.mdc-text-field--with-leading-icon':'')
				+(dense?'.mdc-text-field--dense':'')
				+(disabled?'.mdc-text-field--disabled':'')
			,{
				style: { width: '100%'},
			},[
				(leadingfaicon ? m('i.mdc-text-field__icon.fa.fa-'+leadingfaicon):''),
				m('input.mdc-text-field__input', nativeattrs),
				fullwidth||outlined&&false?'':m('label'
					+'.mdc-floating-label',
					{'for': vn.attrs.id}, [
					vn.attrs.label,
				]),
				(outlined? []: m('.mdc-line-ripple')),
				(outlined? m('.mdc-notched-outline',
					m('svg', m('path.mdc-notched-outline__path'))):[]),
				(outlined? m('.mdc-notched-outline__idle'):''),
				(faicon ? m('i.mdc-text-field__icon.fa.fa-'+faicon):[]),
			]),
			m('.mdc-text-field-helper-text'+
				'.mdc-text-field-helper-text--persistent'+
				'.mdc-text-field-helper-text--validation-msg'+
				'', {
				id: help_id,
				'aria-hidden': true,
				},
				help
			),
		]);
	},
};

TextField.Example = {};
TextField.Example.view = function(vn) {
	const Layout = require('./layout');
	return m(Layout, m('h2', 'TextFields'),
		['','boxed','outlined','fullwidth'].map(function(type) {
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
		}),
		);
	}),
	m(Layout.Row, [
		{
			id: 'required',
			label: _('Required field'),
			required: true,
			type: 'requ',
		},
		{
			id: 'number',
			label: _('Numeric field'),
			type: 'number',
			min: 5,
			max: 12,
		},
		{
			id: 'binary',
			label: _('Binary Regexp'),
			pattern: '[01]*'
		},
		{
			id: 'email',
			boxed: true,
			label: _('Email'),
			type: 'email',
		},
		{
			id: 'validator',
			label: _('Custom Validated'),
			onchange: function(ev) {
				console.log("Validating", ev);
			},
		},
	].map(function(v) {
		return m(Layout.Cell, {span:4}, m(TextField, v));
	})),
	);
};


module.exports = TextField

// vim: noet ts=4 sw=4
