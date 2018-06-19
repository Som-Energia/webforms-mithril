'use strict';
var m = require('mithril');
var _ = require('./translate');
var css = require('./style.styl');
var Layout = require('./layout');
var Row = Layout.Row;
var Cell = Layout.Cell;
var Select = require('./select');
var ValidatedInput = require('./validatedinput');
var StateCityChooser = require('./statecity');
require('@material/button/dist/mdc.button.css');
require('font-awesome/css/font-awesome.css');

require('@material/typography/dist/mdc.typography.css').default;
var mdcAutoInit = require('@material/auto-init').default;

var Persona = {
	field: undefined,
	name: undefined,
	nif: undefined,
	nifValidation: {},
};

var PersonalDataEditor = {
	view: function(vn) {
		return m(Layout, [
			m(StateCityChooser),
			m(Row, [
				m(Cell,
					m(ValidatedInput, {
						id: 'caixa1',
						label: _('Caixa 1'),
						help: _('La primera caixa'),
					})
				),
				m(Cell,
					m(ValidatedInput, {
						id: 'caixa2',
						label: _('Caixa 2'),
						help: _('La segona caixa'),
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
			m(Row, [
				m(Cell, {span:12},
					m(Select.Example),
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
		return m('.form',
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

		]);
	},
};


window.onload = function() {
	var element = document.getElementById("mithril-target");
	m.mount(element, Form);
};
// vim: noet ts=4 sw=4
