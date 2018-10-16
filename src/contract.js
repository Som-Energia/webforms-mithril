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
var showall = true;

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
			m('h1', _('CONTRACT_FORM')),
			m(Wizard, {
				showall: showall,
				pages:[
					IntroPage(),
					PasswordPage(),
					CupsPage(),
					HolderPage(),
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
		title: _('WELCOME'),
		validator: function() {
			return intro.validationErrors && intro.validationErrors();
		},
		content: [
			m(IntroContract, {
				model: intro
			}),
		],
	};
};
/*
Tests:
- No entra si hay sesion abierta
- No entra si el nif no existe
- Next se activa solo cuando hay algo escrito
- Si borras la contraseña se vuelve a desactivar
- Si pones una contraseña y le das a siguiente el boton se queda pensando
- Si la contraseña era mala aparece un mensaje de error y botón desactivo
- Despues de contraseña mala, se queda inactivo hasta que editas algo
*/
var PasswordPage = function() {
	var model = Contract.intro;
	return {
		id: 'password_page',
		title: _('IDENTIFY'),
		skipif: function() { return model.vatexists!==true || model.sessionActive===true; },
		validator: function() { 
			if (model.wrongpassword===true)
				return _('WRONG_PASSWORD');
			if (!model.password)
				return '';
		},
		next: function() {
			return new Promise(function (resolve, reject) {
				UserValidator.openSession(
					model.vatvalue,
					model.password,
				).then(function(data) {
					console.log('valid', data);
					model.name = data.name;
					model.sessionActive = true; // TODO: maybe a session cookie?
					resolve(true);
				}).catch(function(reason) {
					console.log('invalid', reason);
					model.wrongpassword = true;
					reject(reason);
				});
			});
		},
		content: [ m(Row, [
			m(Cell, {span:12}, m('', _('FILL_PASSWORD'))),
			m(Cell, {span:12}, m(TextField, {
				label: _('PASSWORD_LABEL'),
				leadingfaicon: 'key',
				type: 'password',
				boxed: true,
				help: m('a', {
					href: _('PASSWORD_HELP_URL'),
					target: '_blank'
					}, _('PASSWORD_HELP')),
				oninput: function(ev) {
					model.password = ev.target.value;
					model.wrongpassword = false;
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
		title: _('HOLDER_PERSONAL_DATA'),
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
