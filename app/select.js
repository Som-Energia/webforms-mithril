'use strict';
var m = require('mithril');
var Layout = require('./layout');
var _ = require('./translate');
var Row = Layout.Row;
var Cell = Layout.Cell;
var MDCSelect = require('@material/select');
require('@material/select/dist/mdc.select.css');

var Select = {
	oninit: function(vn) {
	},
	oncreate: function(vn) {
		var mdcselect = vn.dom.querySelector('.mdc-select');
		this.mdcinstance = new MDCSelect.MDCSelect(mdcselect);
	},
	view: function(vn) {
		const options = vn.attrs.options || [];
		const help_id = vn.attrs.id+'_help';
		return m('.mdc-form-field', [
			m('.mdc-select.mdc-select--box', {
				style: {width: '100%'},
				},[
				m('select'+
				'.mdc-select__native-control'+
				'', {
					id: vn.attrs.id,
					required: vn.attrs.required,
					disabled: vn.attrs.disabled,
					'aria-controls': help_id,
					'aria-describedby': help_id,
					value: vn.attrs.value,
					onchange: function(ev) {
						vn.attrs.value = ev.target.value;
						vn.attrs.onchange && vn.attrs.onchange(ev);
					},
				}, 
					m('option', {
						value:'', // label provides
						disabled: vn.attrs.required,
						selected: true
						}),
					options.map(function (v,i) {
						return m('option', v, v.text);
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
		return m('',[
			m(Select, {
				id: 'fan',
				label: _('Tastes'),
				help: _('Select what you like more'),
				required: true,
				//disabled: true,
				value: this.Person.tastes,
				onchange: function(ev) {
					vn.state.Person.tastes = ev.target.value;
				},
				options: [
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
				],
			}),
			m('', _('You are fan of '), this.Person.tastes ),
		]);
	},
};

Select.Example = Example;
module.exports=Select
// vim: noet ts=4 sw=4
