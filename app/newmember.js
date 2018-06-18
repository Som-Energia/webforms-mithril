'use strict';
var m = require('mithril');
var _ = require('./translate');
var css = require('./style.styl');
var Layout = require('./layout');
var Row = Layout.Row;
var Cell = Layout.Cell;
var ValidatedInput = require('./validatedinput');
require('@material/button/dist/mdc.button.css');
require('font-awesome/css/font-awesome.css');
var MDCSelect = require('@material/select');
require('@material/select/dist/mdc.select.css');

var mdcAutoInit = require('@material/auto-init').default;

var Persona = {
	field: undefined,
	name: undefined,
	nif: undefined,
	nifValidation: {},
};

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
						console.log('select onchange', ev);
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

var StateCityChooser = {
};


var PersonalDataEditor = {
	view: function(vn) {
		return m(Layout, [
			m(Row, [
				m(Cell,
					m(Select, {
						id: 'state',
						label: _('State'),
						help: _('Select the state'),
						required: true,
						//disabled: true,
						onchange: function(ev) {
							Persona.gustos = ev.target.value;
						},
						options: [
							{
								value: 'grains',
								text: _('Bread, Cereal, Rice, and Pasta'),
							},
							{
								value: 'vegetables',
								text: _('Vegetables'),
								selected: true,
							},
							{
								value: 'fruits',
								text: _('Apple'),
							},
						],
					})
				),
				m(Cell,
					m(ValidatedInput, {
						id: 'vat',
						label: _('Caixa 1'),
						help: _('cabrpmas'),
					})
				),
				m(Cell,
					m(ValidatedInput, {
						id: 'vat',
						label: _('Caixa 2'),
					})
				),
				m(Cell,
					m(ValidatedInput, {
						id: 'vat',
						label: _('NIF'),
					})
				),
			]),
			m(Row, [
				m(Cell, {span:7},
					m(ValidatedInput, {
						id: 'vat',
						label: _('NIF'),
					})
				),
				m(Cell, {span:5},
					m(ValidatedInput, {
						id: 'vat',
						label: _('NIF'),
					})
				),
			]),
		]);
	},
};

var Form = {
	oncreate: function(vnode) {
//		console.debug('auto init', vnode);
		mdcAutoInit();
	},
	view: function() {
		return m('.form.mdc-layout-grid',
		[
			m(PersonalDataEditor),
			m(ValidatedInput, {
				id: 'afield',
				label: _('Field label'),
				help: _('Field Help'),
				icon: '.fa-spinner.fa-spin',
				value: Persona.field,
				onChange: function(value) {
					Persona.field = value;
				},
			}),
			m(ValidatedInput, {
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
			m(ValidatedInput, {
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

			m('', Persona.name, ' (', Persona.nif, ') ', ' fan de los ', Persona.gustos ),
		]);
	},
};


window.onload = function() {
	var element = document.getElementById("mithril-target");
	m.mount(element, Form);
};
// vim: noet ts=4 sw=4
