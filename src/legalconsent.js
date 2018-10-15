'use strict';
var m = require('mithril');
var _ = require('./translate');
var Checkbox = require('./mdc/checkbox');
var Dialog = require('./mdc/dialog');
/** @module */

/**
@namespace LegalConsent

*/

var checked = false;
var LegalConsent = {
	oninit: function(vn) {
		vn.state.dialog = {};
	},
	view: function(vn) {
		return [ 
			m(Checkbox, {
				id: vn.attrs.id,
				label: vn.attrs.label,
				checked: checked,
				onchange: function(ev) {
					vn.state.dialog.open();
				},
			}),
			m(Dialog, {
				id: vn.attrs.id+'-dialog',
				header: vn.attrs.title,
				model: vn.state.dialog,
				buttons: [{
					text: 'Reject',
					action: 'close',
				},{
					text: 'Accept',
					action: 'accept',
					'default': true,
				}],
				onaccept: function(ev) {
					checked = true;
					m.redraw();
				},
				onclose: function(ev) {
					checked = false;
					m.redraw();
				},
				backdrop: true,
			},[
				"Inner Content"
			]),
		];
	},
};


LegalConsent.Example = {
	view: function(vn) {
		var Layout = require('./mdc/layout');
		return m(Layout,
			m(Layout.Row, m(Layout.Cell, m('h2', 'LegalConsent'))),
			m(Layout.Cell, {span:3},
				m(LegalConsent, {
					id: 'myid',
					label: _('Acepto les condicions'),
					title: _('Condicions Generals'),
				}, 'Standard')
			),
		);
	}
};

module.exports=LegalConsent;

// vim: noet ts=4 sw=4
