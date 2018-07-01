'use strict';
var m = require('mithril');
var _ = require('../translate');
var MDCSelect = require('@material/select');
require('@material/select/dist/mdc.select.css');

var Select = {
	oncreate: function(vn) {
		var mdcselect = vn.dom.querySelector('.mdc-select');
		this.mdcinstance = new MDCSelect.MDCSelect(mdcselect);
	},
	view: function(vn) {
		const options = vn.attrs.options || [];
		const help_id = vn.attrs.id+'_help';
		return m('', [
			m('.mdc-select'+(vn.attrs.boxed?'.mdc-select--box':''), {
				style: {width: '100%'},
				},[
				m('select'+
				'.mdc-select__native-control'+
				'', {
					id: vn.attrs.id,
					required: vn.attrs.required, // TODO: current MDC version does not work yet
					disabled: vn.attrs.disabled,
					'aria-controls': help_id,
					'aria-describedby': help_id,
					value: vn.attrs.value,
					onchange: function(ev) {
						vn.attrs.value = ev.target.value;
						vn.attrs.onchange && vn.attrs.onchange(ev);
					},
					oninvalid: function(ev) {
						console.log("inner invalid");
						vn.attrs.oninvalid(ev);
					},
				}, 
					m('option', {
						value:'', // label provides
						disabled: vn.attrs.required,
						selected: true
						}),
					options.map(function (v,i) {
						return m('option', Object.assign({},v), v.text);
					})
				),
				m('label.mdc-floating-label', vn.attrs.label),
				m('.mdc-line-ripple'),
			]),
			m('.mdc-text-field-helper-text'+
				'.mdc-text-field-helper-text--persistent'+
				'.mdc-text-field-helper-text--validation-msg'+
				'', {
				'aria-hidden': true,
				id: help_id,
				},
				vn.attrs.help
			),
		])
	},
};


var Example = {
	Person: {
		field: undefined,
		name: undefined,
		nif: undefined,
		nifValidation: {},
		tastes: 'vegetables',
	},
	view: function(vn) {
		var self = this;
		const Layout = require('./layout');
		const options = [
			{
				value: 'grains',
				text: _('Bread, Cereal, Rice, and Pasta'),
			},
			{
				value: 'vegetables',
				text: _('Vegetables'),
			},
			{
				value: 'fruits',
				text: _('Apple'),
			},
		];
		return m(Layout, [
			m(Layout.Row, m(Layout.Cell, {span:12},
				m('h2', 'Selects'))),
			m(Layout.Row,['','boxed','outlined'].map(function(style) {
			return m(Layout.Cell,{span:4},
				m(Select, {
					boxed: style=='boxed',
					outlined: style=='outlined',
					id: 'fan',
					label: _('Tastes'),
					help: _('Select what you like more'),
					required: true,
					//disabled: true,
					value: self.Person.tastes,
					onchange: function(ev) {
						vn.state.Person.tastes = ev.target.value;
					},
					options: options,
				}));
			})),
			m(Layout.Row, m(Layout.Cell, {span:12},
				_('You are fan of '), self.Person.tastes )),
		]);
	},
};

Select.Example = Example;

module.exports=Select

// vim: noet ts=4 sw=4
