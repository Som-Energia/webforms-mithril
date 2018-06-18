'use strict';
var m = require('mithril');
var _ = require('./translate');
var css = require('./style.styl');
var Layout = require('./layout');
var Row = Layout.Row;
var Cell = Layout.Cell;
var ValidatedInput = require('./validatedinput');
var Select = require('./select');
require('@material/button/dist/mdc.button.css');
require('font-awesome/css/font-awesome.css');

var mdcAutoInit = require('@material/auto-init').default;

var Persona = {
	field: undefined,
	name: undefined,
	nif: undefined,
	nifValidation: {},
};


var requestSom = require('./somapi').requestSom;

var StateCityChooser = {
	oninit: function(vn) {
		var self = this;
		self.states = []; // TODO: Shared by instances
		self.stateIndex = 0;
		self.state = undefined;
		self.stateError = undefined;
		self.city = undefined;
		self.cityError = undefined;
		self.cities = [];

		self.updateStates();
	},

	updateStates: function(countryid) {
		var self = this;
		requestSom('/data/provincies').then(function(data) {
			self.states = data.data.provincies;
		}).catch(function(reason) {
			console.log("TODO: Failed", reason);
			self.stateError = _('Error loading states');
		});
	},

	updateCities: function(stateid) {
		var self = this;
		self.cities = [];
		self.city = undefined;
		var statename = self.states.find(function(v) {return v.id==stateid;}).name;
		self.cityError = _('Loading municipalities in %{statename}',{statename:statename});
		requestSom('/data/municipis/'+stateid).then(function(data) {
			self.city = undefined;
			self.cityError = undefined;
			self.cities = data.data.municipis;
		}).catch(function(reason) {
			console.log("TODO: Failed", reason);
			self.cityError = _('Error loading cities');
		});
	},

	view: function(vn) {
		var self=this;
		return m(Row, [
			m(Cell, {span:6},
				m(Select, {
					options: this.states.map(function(v) {
						return {
							value: v.id,
							text: v.name,
						};
					}),
					label: _('State'),
					help: this.stateError?this.stateError:(this.states?_('Choose a state'):_('Loading...')),
					required: true,
					value: self.state,
					onchange: function (ev) {
						self.state = ev.target.value;
						self.updateCities(self.state);
						vn.attrs.onchange && vn.attrs.onchange(self)
					},
				})
			),
			m(Cell, {span:6},
				m(Select, {
					options: this.cities.map(function(v) {
						return {
							value: v.id,
							text: v.name,
						};
					}),
					label: _('City'),
					help: this.cityError?this.cityError:(this.cities?_('Choose a city'):_('Loading...')),
					required: true,
					value: self.city || '',
					onchange: function (ev) {
						self.city = ev.target.value;
						vn.attrs.onchange && vn.attrs.onchange(self)
					},
				})
			),
		]);
	},
};


var PersonalDataEditor = {
	view: function(vn) {
		return m(Layout, [
			m(StateCityChooser),
			m(Row, [
				m(Cell,
					m(Select, {
						id: 'state',
						label: _('State'),
						help: _('Select the state'),
						required: true,
						//disabled: true,
						value: Persona.gustos,
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
