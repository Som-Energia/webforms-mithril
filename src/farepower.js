'use strict';
var m = require('mithril');
var _ = require('./translate');
var Layout = require('./mdc/layout');
var Row = Layout.Row;
var Cell = Layout.Cell;
var Select = require('./mdc/select');
var ValidatedInput = require('./validatedinput');

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
	var re = /^\d*([.,'])?\d*/g;
	var match = re.exec(value);
	if (!match) return '';
	var result = match[0];
	result.replace(',', '.');
	result.replace('\'', '.');
	return result;
}


const FloatInput = {
	view: function(vn) {
		var attrs = Object.assign({},vn.attrs, {
			filter: filterSpanishFloat,
		});
		return m(ValidatedInput,attrs);
	},
};



const FarePower = {
	oninit: function(vn) {
		vn.state.type = 'mono';
		vn.state.power = undefined;
		vn.state.powerp1 = undefined;
		vn.state.powerp2 = undefined;
		vn.state.powerp3 = undefined;
		vn.state.discrimination = 'nodh';
		vn.state.currentError = undefined;
	},


	fare: function() {
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
	},

	errors: function(vn) {
		var self=vn.state;
		self.currentError = undefined;
		function error(message) {
			if (self.currentError !== message) {
				self.currentError = message;
				console.log(message, self);
			}
			return message;
		}
		if (self.type===undefined) {
			return error('NO_MONOPHASE_CHOICE');
		}
		if (self.power === undefined) {
			return error('NO_POWER_CHOSEN');
		}
		var fare = self.fare();
		if (fare === '3.0A') {
			if (self.powerp1 === undefined) {
				return error('NO_POWER_CHOSEN_P1');
			}
			if (self.powerp2 === undefined) {
				return error('NO_POWER_CHOSEN_P2');
			}
			if (self.powerp3 === undefined) {
				return error('NO_POWER_CHOSEN_P3');
			}
			// some of the periods should be over 15
			if (self.powerp1 <= 15 && self.powerp2 <= 15 && self.powerp3 <= 15) {
				return error('INVALID_POWER_30');
			}
			// none of the periods should be over 450
			if (self.powerp1 > 450 || self.powerp2 > 450 || self.powerp3 > 450) {
				return error('INVALID_POWER_30');
			}
		}
		else {
			if (self.discrimination===undefined) {
				return error('NO_HOURLY_DISCRIMINATION_CHOSEN');
			}
		}
		return undefined;
	},

	powerlist: function(vn) {
		var availablePowers = (
			vn.state.type==='mono'?
				availablePowersMonophase:
			vn.state.type==='tri'?
				availablePowersTriphase:
				[]);

		return [{
			value: undefined,
			text: _('%{fare}-Fare',{fare:'2.0'}),
			style: "direction: rtl; font-weight: bold; background-color:#df9;",
			disabled: true,
		}]
		.concat(availablePowers.filter(function(v) { return v<10; })
			.map(function(v) {
				return {
					value: v,
					text: v,
					style: 'background-color: #df9',
				};
			}))
		.concat([{
			value: undefined,
			text: _('%{fare}-Fare',{fare:'2.1'}),
			style: "direction: rtl; font-weight: bold; background-color:#ae7;",
			disabled: true,
		}])
		.concat(availablePowers.filter(function(v) { return v>=10; })
			.map(function(v) {
				return {
					value: v,
					text: v,
					style: 'background-color: #ae7',
				};
			}))
		.concat(vn.state.type === 'tri'?[{
			value: undefined,
			text: _('%{fare}-Fare',{fare:'3.0'}),
			disabled: true,
			style: 'background-color:#9d6; direction: rtl;',
		},{
			value: '15',
			text: _('More than 15kW'),
			style: 'background-color:#9d6',
		}]:[]);
	},

	view: function (vn) {
		var self=vn.state;
		vn.attrs.onupdate(vn.state);
		self.currentErrors = self.errors(vn);


		return [m(Row, [
			m(Cell, {span: 4}, [
				m(Select, {
					id: 'instal_type',
					value: vn.state.type,
					onchange: function(ev) {
						vn.state.power = '';
						vn.state.type = ev.target.value;
					},
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
				}),
			]),
			m(Cell, {span: 4}, [
				m(Select, {
					id: 'power',
					label: _('Power (kW)'),
					options: self.powerlist(vn),
					required: true,
					help: _('How much do I need?'),
					value: vn.state.power,
					onchange: function(ev) {
						vn.state.power = ev.target.value;
						if (vn.state.power === '15') {
							vn.state.discrimination='nodh';
						}
					},
				}),
			]),
			m(Cell, {span: 4, style: vn.state.power==='15'?'display:none':''}, [
				m(Select, {
					id: 'discrimination',
					label: _('Discrimination'),
					required: true,
					disabled: vn.state.power === '15',
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
					value: vn.state.discrimination,
					onchange: function(ev) {
						vn.state.discrimination = ev.target.value;
					},
				}),
			]),
		]),
		(vn.state.power===undefined || !vn.state.power || parseFloat(vn.state.power)<15)?[]:
		m(Row, [
			m(Cell, {span: 4}, [
				m(FloatInput, {
					id: 'powerp1',
					label: _('Power Period P1 (kW)'),
					help: _('Punta: De 11h a 15h en Verano, de 18h a 22h en Invierno'),
					required: true,
					value: vn.state.powerp1,
					onChange: function(value) {
						console.log("vn.state", vn.state);
						vn.state.powerp1 = value;
					},
				}),
			]),
			m(Cell, {span: 4}, [
				m(FloatInput, {
					label: _('Power Period P2 (kW)'),
					help: _('Llano: Resto del dia'),
					required: true,
					value: vn.state.powerp2,
					onChange: function(value) {
						vn.state.powerp2 = value;
					},
				}),
			]),
			m(Cell, {span: 4}, [
				m(FloatInput, {
					label: _('Power Period P3 (kW)'),
					help: _('Valle: De 0h a 8h todo el año'),
					required: true,
					value: vn.state.powerp3,
					onChange: function(value) {
						vn.state.powerp3 = value;
					},
				}),
			]),
		]),
		m(Row, [
			m(Cell, {span: 2}),
			m(Cell, {span: 8, align: 'center'}, [
				m('p.mdc-card.gren[style="text-align:center;margin-bottom:3ex"]',
				vn.state.fare()?
					m.trust(_('Your fare is <b class="green">%{fare}</b>', {fare: vn.state.fare()}))
				:''),
			]),
			m(Cell, {span: 2}),
		]),

		];
	},
};




module.exports = FarePower;

// vim: noet ts=4 sw=4
