'use strict';
var m = require('mithril');
var Checkbox = require('./mdc/checkbox');
/** @module */

/**
@namespace LegalConsent

*/

var checked = false;
var LegalConsent = {
	view: function(vn) {
		return m(Checkbox, {
			id: 'myid',
			label: 'Acepto las condicions',
			checked: checked,
			onchange: function(ev) {
				console.log("Checked");
			},
		});
	},
};


LegalConsent.Example = {
	view: function(vn) {
		var Layout = require('./mdc/layout');
		return m(Layout,
			m(Layout.Row, m(Layout.Cell, m('h2', 'LegalConsent'))),
			m(Layout.Cell, {span:3}, m(LegalConsent, 'Standard')),
		);
	}
};

module.exports=LegalConsent;

// vim: noet ts=4 sw=4
