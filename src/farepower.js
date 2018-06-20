'use strict';
var m = require('mithril');
var _ = require('./translate');
var Layout = require('./layout');
var Row = Layout.Row;
var Cell = Layout.Cell;
var Select = require('./select');
var ValidatedInput = require('./validatedinput');
var requestSom = require('./somapi').requestSom;

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


var FarePowerModel = {
	type: 'mono',
	power: undefined,
	powerp2: undefined,
	powerp3: undefined,
	discrimination: undefined,

	fare: function() {
		var newFare = (
			this.power+0 < 10 ? '2.0' : (
			this.power+0 < 15 ? '2.1' : (
			this.power!==undefined ? '3.0' :
			undefined)));
		if (newFare!=='3.0' && newFare !== undefined) {
			//$scope.form.power=$scope.form.newpower;
		}
		if (newFare === undefined) { return undefined; }
		var discrimination = this.power+0<15 ?
			this.discrimination : 'nodh';
		if (this.discrimination===undefined) { return undefined; }
		newFare += { nodh:'A', dh:'DHA', dhs:'DHS' }[this.discrimination];
		return newFare;
	}
};

const FarePower = {
    oninit: function(vn) {
        FarePowerModel.type = 'mono';
        FarePowerModel.power = undefined;
        FarePowerModel.discrimination = 'nodh';
    },

    view: function (vn) {
        var self=this;
        var availablePowers = (
			FarePowerModel.type==='mono'?
				availablePowersMonophase:
			FarePowerModel.type==='tri'?
				availablePowersTriphase:
				[]);
        return [m(Row, [
            m(Cell, {span: 4}, [
                m(Select, {
                    id: 'instal_type',
                    value: FarePowerModel.type,
                    onchange: function(ev) {
                        FarePowerModel.type = ev.target.value;
                    },
                    label: _('Installation type'),
					required: true,
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
					id: 'discrimination',
                    label: _('Discrimination'),
					required: true,
                    options: [{
						value: 'nodh',
						text: _('No time discrimination'),
						},{
						value: 'dh',
						text: _('Two periods discrimination'),
						},{
						value: 'dhs',
						text: _('Three periods discrimination'),
					}],
					value: FarePowerModel.discrimination,
					onchange: function(ev) {
						FarePowerModel.discrimination = ev.target.value;
					},
				}),
			]),
            m(Cell, {span: 4}, [
                m(Select, {
					id: 'power',
                    label: _('Power (kW)'),
                    options: availablePowers.map(function(v) {
						return {
							value: v,
							text: v,
							style: {'background-color': '#3f2'},
						};
					}).concat(FarePowerModel.type === 'tri'?[{
						value: 15,
						text: _('More than 15kW'),
					}]:[]),
					required: true,
					value: FarePowerModel.power,
					onchange: function(ev) {
						FarePowerModel.power = ev.target.value;
					},
                }),
			]),
            m(Cell, {span: 4}, [
                m(ValidatedInput, {
					id: 'powerp1',
                    label: _('Power Period P1 (kW)'),
					required: true,
					value: FarePowerModel.power,
					onchange: function(ev) {
						FarePowerModel.power = ev.target.value;
					},
                }),
			]),
            m(Cell, {span: 4}, [
                m(ValidatedInput, {
                    label: _('Power Period P2 (kW)'),
					required: true,
					value: FarePowerModel.powerp2,
					onchange: function(ev) {
						FarePowerModel.powerp2 = ev.target.value;
					},
                }),
			]),
            m(Cell, {span: 4}, [
                m(ValidatedInput, {
                    label: _('Power Period 3 (kW)'),
					required: true,
					value: FarePowerModel.powerp3,
					onchange: function(ev) {
						FarePowerModel.powerp3 = ev.target.value;
					},
                }),
			]),
			m(Cell, {span: 4}, [
				FarePowerModel.fare()?
				_('La teva tarifa es %{fare}', {fare: FarePowerModel.fare()}):'',
			]),
        ])];
	},
};




module.exports = FarePower;

// vim: noet ts=4 sw=4
