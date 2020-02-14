'use strict';
/** @module */

var m = require('mithril');
var _ = require('./translate');
var moment = require('moment');
var TextField = require('./mdc/textfield');
var Inspector = require('./inspector');
var MdDateTimePicker = require('md-date-time-picker/dist/js/mdDateTimePicker').default;
require('md-date-time-picker/dist/css/themes/light/light-green/mdDateTimePicker.css');

/**
@namespace DatePicker
@description A text field for dates and times.

@property {string} id - (it won't work if you don't provide one)
@property {string} label - Text to be shown as label of the input
@property {string} help - Helper text to be shown in the bottom of the control
@property {bool} disabled - Disables the input
@property {bool} boxed - Activates the boxed style
@property {bool} outlined - Activates the outlined style
@property {string} value - The currently selected value
@property {function} onchange  - A callback to be called when the user changes the value
@property {bool} autoclose - True to close on click
@property {moment} future - Later date to be chosed in the future, default: today
@property {moment} past - Earlier date to be chosed in the past

@todo property required: non required should allow to clear the date
@todo property future/past: are set the first time and then ignored

*/

var DatePicker = {};
DatePicker.view = function(vn){
    return m(TextField, {
		label: vn.attrs.label,
		help: vn.attrs.help,
		disabled: vn.attrs.disabled,
		boxed: vn.attrs.boxed,
		outlined: vn.attrs.outlined,
		value: vn.state.value===undefined?' - - / - - / - - - - ':vn.state.value.format('DD/MM/YYYY'),
		leadingfaicon: 'calendar',
		required: vn.attrs.required,
		faicon: vn.state.value !== undefined && !vn.attrs.required && 'times-circle',
		iconaction: vn.attrs.required || function() {
			vn.state.value=undefined;
			vn.attrs.onchange && vn.attrs.onchange(vn.state.value);
		},
	});
};

DatePicker.oninit = function(vn){
	vn.state.value = vn.attrs.value;
	vn.state.toggle = function () {
		if (!vn.state.disabled) {
			vn.state.dialog.toggle();
		}
	};
	vn.state.updateValue = function() {
		vn.state.value=vn.state.dialog.time;
		vn.attrs.onchange && vn.attrs.onchange(vn.state.value);
		m.redraw();
	};
};

DatePicker.oncreate = function(vn){
	vn.state.disabled = vn.attrs.disabled;
	var field = vn.dom;
	vn.state.dialog = new MdDateTimePicker({
        type: 'date',
        future: vn.attrs.future,
        past: vn.attrs.past,
		trigger: field,
		autoClose: vn.attrs.autoclose,
		orientation: vn.portrait?'PORTRAIT':'LANDSCAPE',
    });
	field.addEventListener('onOk', vn.state.updateValue);
	field.addEventListener('click', vn.state.toggle);
};
DatePicker.onupdate = function(vn){
	vn.state.dialog.trigger = vn.dom;
	vn.state.disabled = vn.attrs.disabled;
};


DatePicker.Example = {};
DatePicker.Example.fromdate = undefined;
DatePicker.Example.todate = undefined;
DatePicker.Example.view = function(vn){
	var Layout = require('./mdc/layout');
    return m(Layout, m(Layout.Row,
		m(Layout.Cell, {span:12}, m('h2', 'DatePicker')),
		m(Layout.Cell, {span:6},
			m(DatePicker, {
				id: 'fromdate',
				label: _('From'),
				help: _('First day that will be included'),
				value: DatePicker.Example.fromdate,
				future: moment().add(20,'years'),
				onchange: function(newvalue) {
					console.log("changin from ", newvalue);
					DatePicker.Example.fromdate=newvalue;
				},
				boxed: true,
				autoclose: true,
		})),
		m(Layout.Cell, {span:6},
			m(DatePicker, {
				id: 'todate',
				label: _('To'),
				help: _('Last day that will be included'),
				value: DatePicker.Example.todate,
				future: moment().add(20,'years'),
				onchange: function(newvalue) {
					console.log("changin to ", newvalue);
					DatePicker.Example.todate=newvalue;
				},
				boxed: true,
				autoclose: true,
		})),
		m(Layout.Cell, {span:6},
			m(_("hola"))
		),
		m(Inspector, {
			model: DatePicker.Example,
			shortcut: 'ctrl+shift+d',
		}),
	));
};

module.exports=DatePicker;

// vim: noet ts=4 sw=4
