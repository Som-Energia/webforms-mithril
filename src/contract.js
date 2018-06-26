'use strict';
var m = require('mithril');
var _ = require('./translate');
var css = require('./style.styl');
var Wizard = require('./wizard');
var Layout = require('./mdc/layout');
var Row = Layout.Row;
var Cell = Layout.Cell;
var Button = require('./mdc/button');
var Select = require('./mdc/select');
var TextField = require('./mdc/textfield');
var ValidatedField = require('./validatedfield');
var StateCityChooser = require('./statecity');
var FarePower = require('./farepower');
require('font-awesome/css/font-awesome.css');
require('@material/typography/dist/mdc.typography.css').default;


var showall = false;

var Contract = {
	holder: {
		vat: { data: {}},
		isphisical: function() {
			if (this.vat===undefined) return undefined;
			if (this.vat.value===undefined) return undefined;
			var firstchar = this.vat.value[0];
			return '0123456789KLMXYZ'.indexOf(firstchar) !== -1;
		},
	},
};

var Form = {};
Form.view = function(vn) {
	return [
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
		m('pre', JSON.stringify(Contract, null, 2)),
	];
};


var IntroPage = function() {
	return m('.page', {
		id: 'intro',
		title: _('Intro'),
		next: 'holder',
	},[ m(Row, m(Cell, {span:12},
		m('.intro',_('CONTRACT_INTRO')),
	))]);
};

var HolderPage = function() {
	var holder = Contract.holder;
	var passwordRequired = (
		holder.vat.isvalid===true &&
		holder.vat.exists===true &&
		true);
		
	var detailsRequired = (
		holder.vat.isvalid===true && 
		holder.vat.exists!==true &&
		true);
		
	return m('.page', {
		id: 'holder',
		title: _('Holder'),
		next: 'supply',
		prev: 'intro',
	},[

		m(Row, [
			m(Cell, {span:4}, m(ValidatedField, {
				id: 'vat',
				checkurl: '/check/vat/',
				label: _('NIF'),
				boxed: true,
				required: true,
				maxlength: 9,
				fieldData: holder.vat,
				inputfilter: function(value) {
					if (!value) return value;
					value=value.toUpperCase();
					value=value.replace(/[^0-9A-Z]/,'');
					return value.slice(0,9);
				},
				onvalidated: function() {
					holder.vat.exists=true;
				}
			})),
			passwordRequired? m(Cell, {span:4}, m(ValidatedField, {
				type: 'password',
			})):'',
		]),
		detailsRequired || true? [
			m(Row, [
				m(Cell, {span:5}, m(TextField, {
					id: 'name',
					label: _('Name'),
					value: holder.name,
					oninput: function(ev) {
						holder.name = ev.target.value;
					},
					required: true,
					boxed: true,
				})),
				holder.isphisical()?
					m(Cell, {span:7}, m(TextField, {
						id: 'suname',
						label: _('Surname'),
						value: holder.surname,
						oninput: function(ev) {
							holder.surname = ev.target.value;
						},
						required: true,
						boxed: true,
					}))
				:'',
			]),
			m(StateCityChooser, {
				onvaluechanged: function(chooser) {
					console.log(chooser, holder);
					holder.state = chooser.states.find(function(v) {
						return v.id==chooser.state;
					});
					holder.city = chooser.cities.find(function(v) {
						return v.id==chooser.city;
					});
				},
			}),
			m(Row,
				m(Cell, {span:12}, m(TextField, {
					id: 'streetaddress',
					label: _('Street address'),
					value: holder.streetaddress,
					oninput: function(ev) {
						holder.streetaddress = ev.target.value;
					},
					required: true,
					boxed: true,
					
				})),
			),
		]:'',

	]);
};

var SupplyPage = function() {
	return m('.page', {
		id: 'supply',
		title: _('Supply'),
		next: 'terms',
		prev: 'holder',
	},[
	]);
};

var TermsPage = function() {
	return m('.page', {
		id: 'terms',
		title: _('Terms'),
		next: 'payment',
		prev: 'supply',
	},[
	]);
};

var PaymentPage = function() {
	return m('.page', {
		id: 'payment',
		title: _('Payment'),
		next: 'review',
		prev: 'terms',
	},[
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
