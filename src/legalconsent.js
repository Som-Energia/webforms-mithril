'use strict';
var m = require('mithril');
var _ = require('./translate');
var Checkbox = require('./mdc/checkbox');
var Dialog = require('./mdc/dialog');
var GeneralConditions = {
	LANGKEY: require('./generalconditions-ca.html'), // default
	//en: require('./generalconditions-en.html'),
	es: require('./generalconditions-ca.html'),
	//es: require('./generalconditions-es.html'),
	//gl: require('./generalconditions-gl.html'),
	//eu: require('./generalconditions-eu.html'),
};

/** @module */

/**
@namespace LegalConsent

*/

var LegalConsent = {
	oninit: function(vn) {
		vn.state.dialog = {};
	},
	view: function(vn) {
		return [
			m(Checkbox, {
				id: vn.attrs.id,
				label: vn.attrs.label,
				checked: vn.attrs.accepted,
				onchange: function(ev) {
					vn.state.dialog.open();
				},
			}),
			m(Dialog, {
				id: vn.attrs.id+'-dialog',
				header: vn.attrs.title,
				model: vn.state.dialog,
				buttons: [{
					text: _('I_DECLINE'),
					unelevated: true,
					action: 'close',
				},{
					raised: true,
					text: _('I_ACCEPT'),
					action: 'accept',
					'default': true,
				}],
				onaccept: function(ev) {
					vn.attrs.onchanged(true);
					m.redraw();
				},
				onclose: function(ev) {
					vn.attrs.onchanged(false);
					m.redraw();
				},
				backdrop: true,
			},[
				vn.children
			]),
		];
	},
};


LegalConsent.Example = {};
LegalConsent.Example.marxcontract = false;
LegalConsent.Example.devilcontract = true;
LegalConsent.Example.contractiframe = false;
LegalConsent.Example.contractfile = false;
LegalConsent.Example.view = function(vn) {
	var Layout = require('./mdc/layout');
	return m(Layout,
		m(Layout.Row, m(Layout.Cell, m('h2', 'LegalConsent'))),
		m(Layout.Cell, {span:3},
			m(LegalConsent, {
				id: 'legalconsent_example_marx',
				accepted: LegalConsent.Example.marxcontract,
				onchanged: function(value){
					LegalConsent.Example.marxcontract = value;
				},
				label: _('Accepto les condicions'),
				title: _('Condicions Generals'),
			}, [
				m('', _('La parte contratante de la primera parte, será considerada como la parte contratante de la primera parte. ')),
			])

		),
		m(Layout.Cell, {span:3},
			m(LegalConsent, {
				id: 'legalconsent_example_devil',
				accepted: LegalConsent.Example.devilcontract,
				onchanged: function(value){
					LegalConsent.Example.devilcontract = value;
				},
				label: _('Accepto lo que me digas'),
				title: _('Pacto con el diablo'),
			}, [
				m('p', _('We own you, and you know it')),
			])
		),
		m(Layout.Cell, {span:3},
			m(LegalConsent, {
				id: 'legalconsent_example_marx_iframe',
				accepted: LegalConsent.Example.contractiframe,
				onchanged: function(value){
					LegalConsent.Example.contractiframe = value;
				},
				label: _('Accepto les condicions (iframe)'),
				title: _('Condicions Generals'),
			}, [
				m('iframe', {
					width: 500,
					height: "100%",
					src: 'https://www.somenergia.coop/condicions_generals.htm',
				}),
			])
		),
		m(Layout.Cell, {span:3},
			m(LegalConsent, {
				id: 'legalconsent_example_marx_file',
				accepted: LegalConsent.Example.contractfile,
				onchanged: function(value){
					LegalConsent.Example.contractfile = value;
				},
				label: _('Accepto les condicions'),
				title: _('Condicions Generals'),
			}, [
			_('LANGKEY'),
			m.trust(GeneralConditions[_('LANGKEY')])
			])
		),
	);
};

module.exports=LegalConsent;

// vim: noet ts=4 sw=4
