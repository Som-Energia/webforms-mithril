'use strict';
var m = require('mithril');
var _ = require('./translate');
var Layout = require('./mdc/layout');
var Row = Layout.Row;
var Cell = Layout.Cell;
var Select = require('./mdc/select');
var ValidatedField = require('./validatedfield');
var TextField = require('./mdc/textfield');

const rates = {
	RATE_20A:   '2.0A',
	RATE_20DHA: '2.0DHA',
	RATE_20DHS: '2.0DHS',
	RATE_21A:   '2.1A',
	RATE_21DHA: '2.1DHA',
	RATE_21DHS: '2.1DHS',
	RATE_30A:   '3.0A',
};
const availablePowersMonophase = [
/*
	0.345,
	0.69,
	0.805,
*/
	1.15,
	1.725,
	2.3,
	3.45,
	4.6,
	5.75,
	6.9,
	8.05,
	9.2,
	10.35,
	11.5,
	14.49,
];
const availablePowersTriphase = [
/*
	1.039,
	2.078,
*/
	2.425,
	3.464,
	5.196,
	6.928,
	10.392,
	13.856,
/*
	17.321,
	20.785,
	24.249,
	27.713,
	31.177,
	34.641,
	43.648,
*/
];

function filterSpanishFloat(value) {
	if (!value) {return value;}
	value = value.replace(/[^0-9,.']/, '');
	value = value.replace(/[',]/, '.');
	var parts = value.split('.');
	value = (parts[0]||'0')+(parts.slice(1).length?('.'+parts.slice(1).join('')):'');
	return value;
}


const FloatInput = {
	view: function(vn) {
		var attrs = Object.assign({},vn.attrs, {
			inputfilter: filterSpanishFloat,
		});
		return m(TextField,attrs);
	},
};


const FarePower = {
	oninit: function(vn) {
		vn.state.model = vn.attrs.model || {};
		vn.state.model.error = undefined;
		vn.state.model.type = 'mono';
		vn.state.model.power = undefined;
		vn.state.model.powerp1 = undefined;
		vn.state.model.powerp2 = undefined;
		vn.state.model.powerp3 = undefined;
		vn.state.model.discrimination = 'nodh';
		vn.state.model.fare = function() {
			var newFare = (
				this.power === undefined ? undefined :
				this.power === '' ? undefined :
				parseFloat(this.power) < 10 ? '2.0' :
				parseFloat(this.power) < 15 ? '2.1' :
				'3.0');
			if (newFare!=='3.0' && newFare !== undefined) {
				//this.powerp1=this.power;
			}
			if (newFare === undefined) { return undefined; }
			var discrimination = parseFloat(this.power)<15 ?
				this.discrimination : 'nodh';
			if (this.discrimination===undefined) { return undefined; }
			newFare += { nodh:'A', dh:'DHA', dhs:'DHS' }[this.discrimination];
			return newFare;
		};
		vn.state.model.validate = function() {
			var self=this;
			self.error = undefined;
			function error(message) {
				if (self.error !== message) {
					self.error = message;
				}
				return message;
			}
			if (self.type === undefined) {
				return error('NO_MONOPHASE_CHOICE');
			}
			if (self.power === undefined || self.power === '') {
				return error('NO_POWER_CHOSEN');
			}
			var fare = self.fare();
			if (fare === '3.0A') {
				var p1=parseFloat(self.powerp1);
				var p2=parseFloat(self.powerp2);
				var p3=parseFloat(self.powerp3);
				if (isNaN(p1)) {
					return error('NO_POWER_CHOSEN_P1');
				}
				if (isNaN(p2)) {
					return error('NO_POWER_CHOSEN_P2');
				}
				if (isNaN(p3)) {
					return error('NO_POWER_CHOSEN_P3');
				}
				// some of the periods should be over 15
				if (p1 <= 15 && p2 <= 15 && p3 <= 15) {
					return error('INVALID_POWER_30');
				}
				// none of the periods should be over 450
				if (p1 > 450 || p2 > 450 || p3 > 450) {
					// TODO: Different error for power
					return error('INVALID_POWER_30');
				}
			}
			else {
				if (self.discrimination===undefined) {
					return error('NO_HOURLY_DISCRIMINATION_CHOSEN');
				}
			}
			return undefined;
		};
	},


	powerlist: function(vn) {
		/** Computes the list of powers to shown depending on the context */
		var availablePowers = (
			vn.state.model.type==='mono'?
				availablePowersMonophase:
			vn.state.model.type==='tri'?
				availablePowersTriphase:
				[]);

		var label20 = _('%{fare} Fare',{fare:'2.0'});
		var label21 = _('%{fare} Fare',{fare:'2.1'});
		var label30 = _('%{fare} Fare',{fare:'3.0'});
		return [{
			value: undefined,
			text: label20,
			style: "background-color:#df9;",
			group: availablePowers
				.filter(function(v) { return v<10; })
				.map(function(v) {
					return {
						value: v,
						text: v,
					};
				}),
			},{
			value: undefined,
			text: label21,
			style: "background-color:#ae7;",
			group: availablePowers
				.filter(function(v) { return v>=10; })
				.map(function(v) {
					return {
						value: v,
						text: v,
					};
				}),
			}]
		.concat(vn.state.model.type === 'tri'?[{
			value: undefined,
			text: label30,
			style: "background-color:#9d6;",
			group: [{
				value: '15',
				text: _('More than 15kW'),
				style: 'background-color:#9d6',
			}],
		}]:[]);
	},

	onupdate(vn) {
		vn.state.model.validate();
		vn.attrs.onvaluechanged &&
			vn.attrs.onvaluechanged(vn.state);
	},

	view: function (vn) {
		var self=vn.state;

		return [m(Row, [
			m(Cell, {span: 4}, [
				m(Select, {
					id: 'install_type',
					boxed: true,
					label: _('Installation type'),
					required: true,
					help: _('How to identify them?'),
					helpurl: _('http://todo.com'),
					options: [ {
						value: 'mono',
						text: _('Monophase (the usual)'),
					},{
						value: 'tri',
						text: _('Tri-phase'),
					}],
					value: vn.state.model.type,
					onchange: function(ev) {
						vn.state.model.power = '';
						vn.state.model.type = ev.target.value;
						vn.state.model.validate(vn);
						vn.attrs.onvaluechanged &&
							vn.attrs.onvaluechanged(vn.state);
					},
				}),
			]),
			m(Cell, {span: 4}, [
				m(Select, {
					id: 'power',
					label: _('Power (kW)'),
					boxed: true,
					options: self.powerlist(vn),
					required: true,
					help: _('How much do I need?'),
					value: vn.state.model.power,
					onchange: function(ev) {
						vn.state.model.power = ev.target.value;
						if (vn.state.model.power === '15') {
							vn.state.model.discrimination='nodh';
						}
						vn.state.model.validate();
						vn.attrs.onvaluechanged &&
							vn.attrs.onvaluechanged(vn.state);
					},
				}),
			]),
			m(Cell, {span: 4, style: vn.state.model.power==='15'?'display:none':''}, [
				m(Select, {
					id: 'discrimination',
					label: _('Discrimination'),
					boxed: true,
					required: true,
					disabled: vn.state.model.power === '15',
					options: [{
						value: 'nodh',
						text: _('No time discrimination (A)'),
						},{
						value: 'dh',
						text: _('Two periods discrimination (DHA)'),
						},{
						value: 'dhs',
						text: _('Three periods discrimination (DHS)'),
					}],
					help: _('Is time discrimination convinient for me?'),
					value: vn.state.model.discrimination,
					onchange: function(ev) {
						vn.state.model.discrimination = ev.target.value;
						vn.state.model.validate(vn);
						vn.attrs.onvaluechanged &&
							vn.attrs.onvaluechanged(vn.state);
					},
				}),
			]),
		]),
		(vn.state.model.power===undefined || !vn.state.model.power || parseFloat(vn.state.model.power)<15)?[]:
		m(Row, [
			m(Cell, {span: 4}, [
				m(FloatInput, {
					id: 'powerp1',
					label: _('Power Period P1 (kW)'),
					help: _('Punta: Verano de 11h a 15h, Invierno de 18h a 22h'),
					boxed: true,
					required: true,
					value: vn.state.model.powerp1,
					oninput: function(ev) {
						vn.state.model.powerp1 = ev.target.value;
						vn.state.model.validate(vn);
						vn.attrs.onvaluechanged &&
							vn.attrs.onvaluechanged(vn.state);
					},
				}),
			]),
			m(Cell, {span: 4}, [
				m(FloatInput, {
					label: _('Power Period P2 (kW)'),
					help: _('Llano: Resto del dia'),
					boxed: true,
					required: true,
					value: vn.state.model.powerp2,
					oninput: function(ev) {
						vn.state.model.powerp2 = ev.target.value;
						vn.state.model.validate(vn);
						vn.attrs.onvaluechanged &&
							vn.attrs.onvaluechanged(vn.state);
					},
				}),
			]),
			m(Cell, {span: 4}, [
				m(FloatInput, {
					label: _('Power Period P3 (kW)'),
					help: _('Valle: De 0h a 8h todo el año'),
					boxed: true,
					required: true,
					value: vn.state.model.powerp3,
					oninput: function(ev) {
						vn.state.model.powerp3 = ev.target.value;
						vn.state.model.validate(vn);
						vn.attrs.onvaluechanged &&
							vn.attrs.onvaluechanged(vn.state);
					},
				}),
			]),
		]),
		m(Row, [
			m(Cell, {span: 2}),
			m(Cell, {span: 8, align: 'center'}, [
				m('p.mdc-card.gren[style="text-align:center;margin-bottom:3ex"]',
				vn.state.model.fare()?
					m.trust(_('Your fare is <b class="green">%{fare}</b>', {fare: vn.state.model.fare()}))
				:''),
			]),
			m(Cell, {span: 2}),
		]),

		];
	},
};


FarePower.Example = {};
FarePower.Example.view = function(vn) {
	return m(Layout,[
		m(Cell, {span:12}, m('h2', 'FarePower')),
		m(Cell, {span:12}, m(FarePower, {
			onchanged: function(state) {
				vn.state.farepower = state;
			}
		})),
		m(Cell, {span:12}, JSON.stringify(vn.state.farepower,null,2)),
	]);
};


module.exports = FarePower;

// vim: noet ts=4 sw=4
