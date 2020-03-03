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
		vn.state.states = [];
		vn.state.state = undefined;
		vn.state.stateError = undefined;
		vn.state.city = undefined;
		vn.state.cityError = undefined;
		vn.state.cities = [];

		vn.state.updateStates = function(countryid) {
			requestSom('/data/provincies').then(function(data) {
				vn.state.states = data.data.provincies;
				m.redraw();
			}).catch(function(reason) {
				vn.state.stateError = _('Error loading states');
			});
		};

		vn.state.updateStates();

		vn.state.updateCities = function(stateid) {
			vn.state.cities = [];
			vn.state.city = vn.state.city;
			var statename = vn.state.states.find(function(v) {return v.id==stateid;}).name;
			vn.state.cityError = _('Loading municipalities in %{statename}',{statename:statename});
			requestSom('/data/municipis/'+stateid).then(function(data) {
				vn.state.city = vn.state.city;
				vn.state.cityError = undefined;
				vn.state.cities = data.data.municipis;
			}).catch(function(reason) {
				vn.state.cityError = _('Error loading cities');
			});
		};

		vn.state.onupdate = function(vn) {
			vn.state.state = vn.attrs.statevalue;
			var citychanged = vn.state.city !== vn.attrs.cityvalue;
			vn.state.city = vn.attrs.cityvalue;
	
			if(vn.state.state !== undefined){
				if(vn.state.city !== undefined && citychanged)			
					vn.state.updateCities(vn.state.state);
			}	
		};
	},
	view: function(vn) {
		return m(Row, [
			m(Cell, {spandesktop:6, span:4},
				m(Select, {
					options: vn.state.states.map(function(v) {
						return {
							value: v.id,
							text: v.name,
						};
					}),
					label: _('STATE'),
					boxed: true,
					outlined: vn.attrs.outlined,
					help: vn.state.stateError ? vn.state.stateError : (vn.state.states ? '' : _('LOADING_HELP')),
					required: true,
					value: vn.state.state,
					onchange: function (ev) {
						vn.state.state = ev.target.value;
						vn.state.city = undefined;
						vn.state.updateCities(vn.state.state);
						vn.attrs.onvaluechanged && vn.attrs.onvaluechanged(vn.state)
					},
				})
			),
			m(Cell, {spandesktop:6, span:4},
				m(Select, {
					options: vn.state.cities.map(function(v) {
						return {
							value: v.id,
							text: v.name,
						};
					}),
					label: _('CITY'),
					boxed: true,
					outlined: vn.attrs.outlined,
					help: vn.state.cityError ? vn.state.cityError : (vn.state.cities ? '': _('LOADING_HELP')),
					required: true,
					value: vn.state.city || '',
					onchange: function (ev) {
						vn.state.city = ev.target.value;
						vn.attrs.onvaluechanged && vn.attrs.onvaluechanged(vn.state)
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
