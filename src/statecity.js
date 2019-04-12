'use strict';
var m = require('mithril');
var _ = require('./translate');
var Layout = require('./mdc/layout');
var Row = Layout.Row;
var Cell = Layout.Cell;
var Select = require('./mdc/select');
var requestSom = require('./somapi').requestSom;

// TODO: Share state list among instances to reduce api requests
// TODO: Setting the initial values from upper component

var StateCityChooser = {
	oninit: function(vn) {
		var self = this;
		self.states = [];
		self.state = undefined;
		self.stateError = undefined;
		self.city = undefined;
		self.cityError = undefined;
		self.cities = [];

		self.updateStates();
	},

	onupdate: function(vn) {
		var self = this;
		self.state = vn.attrs.statevalue;
		var citychanged = self.city !== vn.attrs.cityvalue;
		self.city = vn.attrs.cityvalue;

		if(self.state !== undefined){
			if(self.city !== undefined && citychanged)			
				self.updateCities(self.state);
		}	
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
		self.city = self.city;
		var statename = self.states.find(function(v) {return v.id==stateid;}).name;
		self.cityError = _('Loading municipalities in %{statename}',{statename:statename});
		requestSom('/data/municipis/'+stateid).then(function(data) {
			self.city = self.city;
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
					label: _('STATE'),
					boxed: true,
					outlined: vn.attrs.outlined,
					help: this.stateError ? this.stateError : (this.states ? ''/*_('STATE_HELP')*/ : _('LOADING_HELP')),
					required: true,
					value: self.state,
					onchange: function (ev) {
						self.state = ev.target.value;
						self.city = undefined;
						self.updateCities(self.state);
						vn.attrs.onvaluechanged && vn.attrs.onvaluechanged(self)
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
					label: _('CITY'),
					boxed: true,
					outlined: vn.attrs.outlined,
					help: this.cityError ? this.cityError : (this.cities ? ''/*_('CITY_HELP')*/ : _('LOADING_HELP')),
					required: true,
					value: self.city || '',
					onchange: function (ev) {
						self.city = ev.target.value;
						vn.attrs.onvaluechanged && vn.attrs.onvaluechanged(self)
					},
				})
			),
		]);
	},
};

StateCityChooser.Example = {};
StateCityChooser.Example.model = {};
StateCityChooser.Example.model2 = {};
StateCityChooser.Example.view = function(vn) {
	var model = StateCityChooser.Example.model;
	var model2 = StateCityChooser.Example.model2;
	return m(Layout,[
		m(Row, m(Cell,{span:12}, m('h2', 'State/City chooser'))),
		m(StateCityChooser, {
			onvaluechanged: function(state) {
				model.state = state.states.find(function(v) {
					return v.id==state.state;
				});
				model.city = state.cities.find(function(v) {
					return v.id==state.city;
				});
			}
		}),
		m(Row, m(Cell, {span:12}, JSON.stringify(model,null,2))),
		m(StateCityChooser, {
			onvaluechanged: function(state) {
				model2.state = state.states.find(function(v) {
					return v.id==state.state;
				});
				model2.city = state.cities.find(function(v) {
					return v.id==state.city;
				});
			}
		}),
		m(Row, m(Cell, {span:12}, JSON.stringify(model2,null,2))),
	]);
};


module.exports = StateCityChooser;

// vim: noet ts=4 sw=4
