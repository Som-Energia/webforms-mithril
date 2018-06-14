'use strict';
var m = require('mithril');
var css = require('./style.styl');
var _ = require('./translate');
require('@material/button/dist/mdc.button.css');
require('@material/layout-grid/dist/mdc.layout-grid.css');
var ValidatedInput = require('./validatedinput');
require('font-awesome/css/font-awesome.css');

var mdcAutoInit = require('@material/auto-init').default;

console.log(ValidatedInput);

m.prop = require('mithril/stream');


var Persona = {
	field: undefined,
	name: undefined,
	nif: undefined,
};

var Form = {
	oncreate: function(vnode) {
//		console.debug('auto init', vnode);
		mdcAutoInit();
	},
	view: function() {
		return m('.form.mdc-layout-grid',
		[
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

			m('', Persona.name, '(', Persona.nif, ')'),
		]);
	},
};


window.onload = function() {
	var element = document.getElementById("mithril-target");
	m.mount(element, Form);
};
// vim: noet ts=4 sw=4
