'use strict';
var m = require('mithril');
var _ = require('./translate');
var Layout = require('./layout');
var Row = Layout.Row;
var Cell = Layout.Cell;
var Select = require('./select');
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
			m(Cell, {spandesktop:6, span:4},
				m(Select, {
					options: this.states.map(function(v) {
						return {
							value: v.id,
							text: v.name,
						};
					}),
					label: _('State'),
					boxed: true,
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
			m(Cell, {spandesktop:6, span:4},
				m(Select, {
					options: this.cities.map(function(v) {
						return {
							value: v.id,
							text: v.name,
						};
					}),
					label: _('City'),
					boxed: true,
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


module.exports = StateCityChooser;

// vim: noet ts=4 sw=4
