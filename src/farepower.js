'use strict';
var m = require('mithril');
var _ = require('./translate');
var Layout = require('./layout');
var Row = Layout.Row;
var Cell = Layout.Cell;
var Select = require('./select');
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


const FarePower = {
	type: 'mono',
	power: undefined,
	powerp1: undefined,
	powerp2: undefined,
	powerp3: undefined,
	discrimination: 'nodh',

	fare: function() {
		console.log('this.power', this.power);
		var newFare = (
			this.power === undefined ? undefined :
			this.power === '' ? undefined :
			parseFloat(this.power) < 10 ? '2.0' :
			parseFloat(this.power) < 15 ? '2.1' :
			'3.0');
		console.log('newFare', newFare);
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

	oninit: function(vn) {
	},

	view: function (vn) {
		var self=this;
		var availablePowers = (
			vn.state.type==='mono'?
				availablePowersMonophase:
			vn.state.type==='tri'?
				availablePowersTriphase:
				[]);

		var powerOptions = [{
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
					help: m.trust(_('See more on <a href="${url}">Trifàsic</a',{
						url: 'http://todo.com',
						})),
					options: [ {
						value: 'mono',
						text: _('Monophase (the normal one)'),
					},{
						value: 'tri',
						text: _('Three phase'),
					}],
				}),
			]),
			m(Cell, {span: 4}, [
				m(Select, {
					id: 'power',
					label: _('Power (kW)'),
					options: powerOptions,
					required: true,
					value: vn.state.power,
					onchange: function(ev) {
						vn.state.power = ev.target.value;
						if (vn.state.power === '15') {
							vn.state.discrimination='nodh';
						}
					},
				}),
			]),
			m(Cell, {span: 4}, [
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
					value: vn.state.discrimination,
					onchange: function(ev) {
						vn.state.discrimination = ev.target.value;
					},
				}),
			]),
		]),
		(vn.state.power===undefined || vn.state.power+0<15)?[]:
		m(Row, [
			m(Cell, {span: 4}, [
				m(ValidatedInput, {
					id: 'powerp1',
					label: _('Power Period P1 (kW)'),
					required: true,
					value: vn.state.powerp1,
					onchange: function(ev) {
						vn.state.powerp1 = ev.target.value;
					},
				}),
			]),
			m(Cell, {span: 4}, [
				m(ValidatedInput, {
					label: _('Power Period P2 (kW)'),
					required: true,
					value: vn.state.powerp2,
					onchange: function(ev) {
						vn.state.powerp2 = ev.target.value;
					},
				}),
			]),
			m(Cell, {span: 4}, [
				m(ValidatedInput, {
					label: _('Power Period 3 (kW)'),
					required: true,
					value: vn.state.powerp3,
					onchange: function(ev) {
						vn.state.powerp3 = ev.target.value;
					},
				}),
			]),
		]),
		m(Row, [
			m(Cell, {span: 2}),
			m(Cell, {span: 8, align: 'center'}, [
				vn.state.fare()?
				m('.green[style="text-align:center"]',
					m.trust(_('Your fare is <b>%{fare}</b>', {fare: vn.state.fare()}))
				):'',
			]),
			m(Cell, {span: 2}),
		])];
	},
};




module.exports = FarePower;

// vim: noet ts=4 sw=4
