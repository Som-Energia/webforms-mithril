'use strict';
/** @module */

var m = require('mithril');
var _ = require('./translate');
var FreddyDatePicker = require('material-datepicker/dist/material-datepicker-with-moment-js.min.js');
require('material-datepicker/dist/material-datepicker.min.css');

var DatePicker = {};
DatePicker.view = function(vn){
    return m('input[type=text]#myid');
};
DatePicker.oncreate = function(vn){
    console.debug("dom:",vn.state.dom);
    console.log("oncreate!");
    vn.state.widget = new FreddyDatePicker('#myid');
    console.debug("widget:",vn.state.widget);
};


DatePicker.Example = {};

DatePicker.Example.view = function(vn){
    return m(DatePicker)
};

module.exports=DatePicker;

// vim: noet ts=4 sw=4
