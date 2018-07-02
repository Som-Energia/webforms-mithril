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
var PersonEditor = require('./personeditor');
var Chooser = require('./chooser');
var Terms = require('./terms');

require('font-awesome/css/font-awesome.css');
require('@material/typography/dist/mdc.typography.css').default;


var Persona = {
	field: undefined,
	name: undefined,
	nif: undefined,
	nifValidation: {},
};

var showall=false;
var skip = function (c) { return []; }


var Form = {
	farepower: undefined,
	view: function(vn) {
		return m('.form.mdc-typography', [
			m(StateCityChooser.Example),
			m(Chooser.Example),
			m(Terms.Example),
			m(Checkbox.Example),
			m(Button.Example),
			m(TextField.Example),
			m(ValidatedField.Example),
			m(Select.Example),
			m(PersonEditor.Example),
			'' && m(Layout,[
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
							return vn.state.farepower.error;
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
