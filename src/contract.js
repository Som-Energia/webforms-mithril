'use strict';
var m = require('mithril');
var _ = require('./translate');
var css = require('./style.styl');
var Wizard = require('./wizard');
var Layout = require('./mdc/layout');
var Row = Layout.Row;
var Cell = Layout.Cell;
var Mousetrap = require('mousetrap');
require('mousetrap-global-bind');
var PersonEditor = require('./personeditor');
var PaymentEditor = require('./paymenteditor');
var Terms = require('./terms');

require('font-awesome/css/font-awesome.css');
require('@material/typography/dist/mdc.typography.css').default;

var showall = false;

Mousetrap.bindGlobal('ctrl+shift+y', function() {
	showall = !showall;
	m.redraw();
	console.log('showall', showall);
	return false;
});

Mousetrap.bindGlobal('ctrl+shift+d', function() {
	var inspector = document.querySelector('.inspector');
	inspector.classList.toggle('shown');
	return false;
});

var Contract = {
	holder: {},
	payment: {},
	terms: {},
};

var Form = {};
Form.view = function(vn) {
	return m('.form.mdc-typography', [
		m('.inspector',
			m('pre', JSON.stringify(Contract, null, 2))),
		m('.main', [
		m(Wizard, {
			showall: showall,
		}, [
			IntroPage(),
			HolderPage(),
			SupplyPage(),
			TermsPage(),
			PaymentPage(),
			ReviewPage(),
		]),
		]),
	]);
};

var IntroPage = function() {
	return m('.page', {
		id: 'intro',
		title: _('Intro'),
		next: 'holder_page',
	},[ m(Row, m(Cell, {span:12},
		m('.intro',_('CONTRACT_INTRO')),
	))]);
};


var HolderPage = function() {
	var holder = Contract.holder;
	return m('.page', {
		id: 'holder_page',
		title: _('Holder'),
		next: 'supply',
		prev: 'intro',
		validator: function() {
			holder.validate && holder.validate();
			return holder.error;
		},
	},[
		m(PersonEditor, {
			id: 'holder',
			model: holder,
		}),
	]);
};

var SupplyPage = function() {
	return m('.page', {
		id: 'supply',
		title: _('Supply'),
		next: 'terms_page',
		prev: 'holder_page',
	},[
	]);
};

var TermsPage = function() {
	return m('.page', {
		id: 'terms_page',
		title: _('Terms'),
		next: 'payment',
		prev: 'supply',
		validator: function() {
			Contract.terms.validate &&
				Contract.terms.validate();
			return Contract.terms.error;
		},
	},[
		m(Terms, {model: Contract.terms}),
	]);
};

var PaymentPage = function() {
	return m('.page', {
		id: 'payment',
		title: _('Payment'),
		next: 'review',
		prev: 'terms_page',
		validator: function() {
			Contract.payment.validate && Contract.payment.validate();
			return Contract.payment.error;
		},
	},[
		m(PaymentEditor, {model: Contract.payment}),
	]);
};

var ReviewPage = function() {
	return m('.page', {
		id: 'review',
		title: _('Review'),
		prev: 'payment',
	},[
	]);
};



window.onload = function() {
	var element = document.getElementById("mithril-target");
	m.mount(element, Form);
};
// vim: noet ts=4 sw=4
