'use strict';
var m = require('mithril');
var _ = require('./translate');
var css = require('./style.styl');
var Wizard = require('./wizard');
var Layout = require('./mdc/layout');
var Row = Layout.Row;
var Cell = Layout.Cell;
var PersonEditor = require('./personeditor');
var PaymentEditor = require('./paymenteditor');
var IntroContract = require('./introcontract');
var Terms = require('./terms');

var Mousetrap = require('mousetrap');
require('mousetrap-global-bind');
require('font-awesome/css/font-awesome.css');
require('@material/typography/dist/mdc.typography.css').default;
var Inspector = require('./inspector');
var showall = false;

Mousetrap.bindGlobal('ctrl+shift+y', function() {
	showall = !showall;
	m.redraw();
	console.log('showall', showall);
	return false;
});

var Contract = {
	intro: {},
	holder: {},
	payment: {},
	terms: {},
};


var Form = {};
Form.view = function(vn) {
	return m('.form.mdc-typography', [
		m(Inspector, {
			shortcut: 'ctrl+shift+d',
			model: Contract,
		}),
		
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
	var intro = Contract.intro;
	return m('.page', {
		id: 'intro_page',
		title: _('Wellcome'),
		next: 'holder_page',
		validator: function() {
			intro.validate && intro.validate();
			return intro.error;
		},
	},[ m(Row, m(Cell, {span:12}, [
		m(IntroContract, {
			model: intro,
		}),
	]))]);
};


var HolderPage = function() {
	var holder = Contract.holder;
	return m('.page', {
		id: 'holder_page',
		title: _('Holder'),
		next: 'supply_page',
		prev: 'intro_page',
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
		id: 'supply_page',
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
		next: 'payment_page',
		prev: 'supply_page',
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
		id: 'payment_page',
		title: _('Payment'),
		next: 'review_page',
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
		id: 'review_page',
		title: _('Review'),
		prev: 'payment_page',
	},[
	]);
};



window.onload = function() {
	var element = document.getElementById("mithril-target");
	m.mount(element, Form);
};
// vim: noet ts=4 sw=4
