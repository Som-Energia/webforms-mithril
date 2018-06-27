'use strict';
var m = require('mithril');
var _ = require('./translate');
var css = require('./style.styl');
var Layout = require('./mdc/layout');
var Row = Layout.Row;
var Cell = Layout.Cell;
var Button = require('./mdc/button');
var Select = require('./mdc/select');
var Checkbox = require('./mdc/checkbox');
var TextField = require('./mdc/textfield');
var ValidatedField = require('./validatedfield');
var Wizard = require('./wizard');
var StateCityChooser = require('./statecity');
var FarePower = require('./farepower');

require('font-awesome/css/font-awesome.css');
require('@material/typography/dist/mdc.typography.css').default;


var Persona = {
	field: undefined,
	name: undefined,
	nif: undefined,
	nifValidation: {},
};

var PersonalDataEditor = {
	view: function(vn) {
		return [
			m(StateCityChooser),
			m(Row, [
				m(Cell,
					m(ValidatedField, {
						id: 'caixa1',
						label: _('Caixa 1'),
						help: _('La primera caixa'),
					})
				),
				m(Cell,
					m(ValidatedField, {
						id: 'caixa2',
						label: _('Caixa 2'),
						help: _('La segona caixa'),
					})
				),
				m(Cell,
					m(ValidatedField, {
						id: 'caixa3',
						label: _('Caixa 3'),
						help: _('I encara una tercera caixa'),
					})
				),
				m(Cell,
					m(Select, {
						id: 'caixa4',
						label: _('Caixa 4'),
						help: _('I aquesta es un select'),
					})
				),
			]),
			m(Row, [
				m(Cell, {span:7},
					m(ValidatedField, {
						id: 'iban',
						label: _('IBAN (compte bancari)'),
						help: _('I encara una tercera caixa'),
						defaulterror: _('Invalid IBAN'),
						required: true,
						checkurl: '/check/iban/',
						fieldData: Persona.iban,
					})
				),
				m(Cell, {span:5},
					m(ValidatedField, {
						id: 'vat',
						label: _('NIF'),
					})
				),
			]),
			m(Row, [
				m(Cell, {span:12},
					m(Select.Example),
				),
			]),
		];
	},
};
var showall=false;
var skip = function (c) { return []; }


var Form = {
	farepower: undefined,
	view: function(vn) {
		return m('.form.mdc-typography', [
			m(Checkbox.Example),
			m(Button.Example),
			m(TextField.Example),
			m(ValidatedField.Example),
			m(Select.Example),
			m(Layout,[
				m(Row, m(Cell,{span:12}, m('h2', 'State/City chooser'))),
				m(StateCityChooser),
				m(FarePower, {
					onchanged: function(state) {
						vn.state.farepower = state;
					}
				}),
				m(Row, m(Cell, {span:12}, JSON.stringify(vn.state.farepower,null,2))),
			]),
			m(Wizard, {showall:showall}, [
				m('.page', {
					id: 'holder',
					title: _('Holder'),
					next: 'supply',
				}, [
					m('.red', m(PersonalDataEditor)),
				]),

				m('.page', {
					id: 'supply',
					title: _('Supply point'),
					prev: 'holder',
					next: 'confirm',
					validator: function() {
						if (vn.state.farepower) {
							return vn.state.farepower.currentError;
						}
					},
				}),
				m('.page', {
					id: 'confirm',
					title: _('Confirmation'),
					prev: 'supply',
				}, m(Row, [
					m(Cell, {span:6}, m(ValidatedField, {
						id: 'afield',
						label: _('Field label'),
						help: _('Field Help'),
						icon: '.fa-spinner.fa-spin',
						value: Persona.field,
						onChange: function(value) {
							Persona.field = value;
						},
					})),
					m(Cell, {span:6}, m(ValidatedField, {
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
					})),
					m(Cell, {span:8}, m(ValidatedField, {
						id: 'name',
						label: _('Name'),
						required: true,
						help: _('Ayuda'),
						value: Persona.name,
						onChange: function(value) {
							Persona.name = value;
						},
					})),
				])),
			]),
		]);
	},
};


window.onload = function() {
	var element = document.getElementById("mithril-target");
	m.mount(element, Form);
};
// vim: noet ts=4 sw=4
