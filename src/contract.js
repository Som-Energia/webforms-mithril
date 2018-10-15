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
var TextField = require('./mdc/textfield');
var ValidatedField = require('./validatedfield');
var UserValidator = require('./uservalidator');

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
	cups: { field: {}},
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
			m('h1', _('Contract Form')),
			m(Wizard, {
				showall: showall,
				pages:[
					IntroPage(),
					PasswordPage(),
					HolderPage(),
					CupsPage(),
					SupplyPage(),
					TermsPage(),
					PaymentPage(),
					ReviewPage(),
				],
			}),
		]),
	]);
};

var IntroPage = function() {
	var intro = Contract.intro;
	return {
		id: 'intro_page',
		title: _('Welcome'),
		validator: function() {
			return intro.validationErrors && intro.validationErrors();
		},
		content: [
			m(IntroContract, {
				model: intro
			}),
		],
		next: function() {
			console.log("Vat exists on next:", intro);
			return true;
		},
	};
};


var PasswordPage = function() {
	var intro = Contract.intro;
	return {
		id: 'password_page',
		title: _('Identify'),
		skipif: function() { return intro.vatexists!==true || intro.sessionActive===true; },
		next: function() {
			return new Promise(function (resolve, reject) {
				UserValidator.openSession(
					intro.vatvalue,
					intro.password,
				).then(function(data) {
					console.log('valid', data);
					intro.name = data.name;
					intro.sessionActive = true; // TODO: maybe a session cookie?
					resolve(true);
				}).catch(function(reason) {
					// TODO: Set the error
					console.log('invalid', reason);
					reject(reason);
				});
			});
		},
		content: [ m(Row, [
			m(Cell, {span:6},
				m('', _('Please, identify yourself using your Virtual Office password'))),
			m(Cell, {span:6},
				m('a', { href: 'TODO', },
				_('[I don\'t remember my password]'))),
			m(Cell, {span:6}, m(TextField, {
				label: _('Password'),
				leadingfaicon: 'key',
				type: 'password',
				boxed: true,
				oninput: function(ev) {
					intro.password = ev.target.value;
				},
			})),
		])],
	};
};

var HolderPage = function() {
	var intro = Contract.intro;
	var holder = Contract.holder;
	return {
		id: 'holder_page',
		title: _('Holder'),
		next: 'supply_page',
		skipif: function() { return intro.vatexists===true; },
		validator: function() {
			holder.validate && holder.validate();
			return holder.error;
		},
		content: [
			m(PersonEditor, {
				id: 'holder',
				model: holder,
			}),
		],
	};
};


var CupsPage = function() {
	var model = Contract.cups;
	return {
		id: 'cups_page',
		title: _('Identify the supply point'),
		next: 'supply_page',
		validator: function() {
			if (!model.field.isvalid) {
				return _('INVALID_SUPPLY_POINT_CUPS');
			}
			return undefined;
		},
		content: [
			m(Row, [
				m(Cell, {span:6}, m(ValidatedField, {
					id: 'cups',
					checkurl: '/check/cups/status/',
					label: _('Supply point identifier (CUPS)'),
					help: _('"ES" followed by 16 numbers and two check letters'),
					boxed: true,
					required: true,
					maxlength: 24,
					fieldData: model.field,
					inputfilter: function(value) {
						return value.toUpperCase();
					},
					onvalidated: function(state) {
						console.log('CUPS validated', state);
					}
				})),
				m(Cell, {span:6}, m(TextField, {
					id: 'cupsaddress',
					label: _('Supply point address'),
					help: _(''),
					boxed: true,
					disabled: true,
					tabindex: -1,
					required: true,
					maxlength: 24,
					value: (model.field.data && model.field.isvalid || '') && model.field.data.address,
				})),
			]),
		],
	};
};

var SupplyPage = function() {
	return {
		id: 'supply_page',
		title: _('Supply'),
		next: 'terms_page',
	};
};

var TermsPage = function() {
	return {
		id: 'terms_page',
		title: _('Terms'),
		next: 'payment_page',
		validator: function() {
			Contract.terms.validate &&
				Contract.terms.validate();
			return Contract.terms.error;
		},
		content: [
			m(Terms, {model: Contract.terms}),
		],
	};
};

var PaymentPage = function() {
	return {
		id: 'payment_page',
		title: _('Payment'),
		next: 'review_page',
		validator: function() {
			Contract.payment.validate && Contract.payment.validate();
			return Contract.payment.error;
		},
		content: [
			m(PaymentEditor, {model: Contract.payment}),
		],
	};
};

var ReviewPage = function() {
	return {
		id: 'review_page',
		title: _('Review'),
	};
};



window.onload = function() {
	var element = document.getElementById("mithril-target");
	m.mount(element, Form);
};
// vim: noet ts=4 sw=4
