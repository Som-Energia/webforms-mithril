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
var Dialog = require('./mdc/dialog');
var Card = require('./mdc/card');

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


var Examples = {
	farepower: undefined,
	view: function(vn) {
		return m('.form.mdc-typography', [
			skip(Dialog.Example),
			m(Card.Example),
			skip(StateCityChooser.Example),
			skip(Chooser.Example),
			skip(Terms.Example),
			skip(Checkbox.Example),
			skip(Button.Example),
			skip(TextField.Example),
			skip(ValidatedField.Example),
			skip(Select.Example),
			skip(PersonEditor.Example),
			skip(Layout,[
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
					m('h2', 'Page 1'),
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
				}, [
					m(FarePower, {model: vn.state.farepower})
				]),
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
	m.mount(element, Examples);
};
// vim: noet ts=4 sw=4
