'use strict';
/** @module */

var m = require('mithril');
var _ = require('./translate');


var DatePicker = {};
DatePicker.view = function(vn){
    return 'Hola Mundo'
};

DatePicker.Example = {};

DatePicker.Example.view = function(vn){
    return m(DatePicker)
};

module.exports=DatePicker;

// vim: noet ts=4 sw=4
