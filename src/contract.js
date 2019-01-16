'use strict';
var m = require('mithril');
var _ = require('./translate');
var css = require('./style.styl');
var Wizard = require('./wizard');
var CheckBox = require('./mdc/checkbox');
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
var DatePicker = require('./datepicker');
var moment = require('moment');

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
	cups: {
		cupsverified: false,
	},
	holder: {},
	switch: {},
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
			m('h1', _('CONTRACT_FORM_TITLE')),
			m(Wizard, {
				showall: showall,
				pages:[
					IntroPage(),
					PasswordPage(),
					CupsPage(),
					HolderPage(),
					SwitchPage(),
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
	holder.vat=intro.vatvalue;

	return {
		id: 'holder_page',
		title: _('HOLDER_PERSONAL_DATA'),
		skipif: function() {
			return intro.vatexists === true;
		},
		validator: function() {
			holder.validate && holder.validate();
			return holder.error;
		},
		content: [
			m(PersonEditor, {
				id: 'holder',
				vat: intro.vatvalue,
				model: holder,
			}),
		],
	};
};

var CupsContract ={};

CupsContract.field = {};

var CupsPage = function() {
	var model = Contract.cups;
	var state = CupsContract;

	return {
		id: 'cups_page',
		title: _('CUPS_TITLE'),
		validator: function() {
			var confirmation_needed = model.cupsaddress !== undefined &&
				model.cupsverified === false &&
				(model.cupsstatus === 'active' || model.cupsstatus === 'inactive') &&
				model.cupsstatus !== 'busy';

			if (model.cupsstatus === 'invalid' && state.field.isvalid === false) {
				return _('INVALID_SUPPLY_POINT_CUPS');
			}
			if (model.cupsstatus === 'busy') {
				return _('CUPS_IN_PROCESS');
			}
			if (confirmation_needed) {
				return _('MARK_ADDRESS_CONFIRMATION_BOX');
			}
			return undefined;
		},
		content: [
			m(Row, [
				m(Cell, {span:12}, _('FILL_CUPS')),
				m(Cell, {span:6}, m(ValidatedField, {
					id: 'cups',
					checkurl: '/check/cups/status/',
					label: _('CUPS_LABEL'),
					help: m('a', {
						href: _('CUPS_HELP_URL'),
						target: '_blank'
						}, _('CUPS_HELP')),
					boxed: true,
					required: true,
					maxlength: 24,
					fieldData: state.field,
					inputfilter: function(value) {
						return value.toUpperCase();
					},

					onvalidated: function(value, data) {
						if (value) {
							model.cupsvalue = value;
							model.cupsaddress = data.address;
							model.cupsstatus = data.status;
						} else {
							model.cupsvalue = undefined;
							model.cupsaddress = undefined;
							model.cupsstatus = 'invalid';
						}
					},
				})),
				m(Cell, {span:12}, m(TextField, {
					id: 'cupsaddress',
					label: _('SUPPLY_POINT_ADDRESS'),
					help: _(''),
					boxed: true,
					disabled: true,
					tabindex: -1,
					required: true,
					maxlength: 24,
					value: (state.field.data && state.field.isvalid)?
						state.field.data.address:'',
				})),
				model.cupsaddress && (model.cupsstatus === 'active' || model.cupsstatus === 'inactive') &&
				m(Cell, {span:12}, m(CheckBox, {
					id: 'cups_verify',
					label: _('CUPS_VERIFY_LABEL'),
					checked: model.cupsverified,
					onchange: function(ev){
						model.cupsverified = ev.target.checked;
					}
				})),
			]),
		],
	};
};



var MeasureValidator = {};
MeasureValidator.validateMeasure = function(cups, date, measure) {
	console.debug("Validating measure", this, cups, date, measure);
	var self = this;
	var promise = new Promise(function(accept, reject) {
		setTimeout(function() {
			if (date.day()===1) { // monday
				promise.catch(function() {m.redraw()})
				reject({
					validationError: 'TODO_ERROR_1',
				});
				return;
			}
			if (measure==='1') {
				promise.catch(function() {m.redraw()})
				reject({
					validationError: 'TODO_ERROR_2',
				});
				return;
			}
			console.log('simulated open session');
			promise.then(function() {m.redraw()})
			accept({
				status: 'ok',
			});
		}, UserValidator._mockPreValidationTimeoutMs);
	});
	return promise;
};


var SwitchPage = function() {

	return {
		id: 'switch_page',
		title: _('SWITCH_TITLE'),
		skipif: function(){
			return Contract.cups.cupsstatus !== 'active';
		},
		validator: function() {
			if (Contract.switch.validationError) {
				return _(Contract.switch.validationError);
			}
			if (!Contract.switch.date) {
				return _('NO_SWITCH_DATE');
			}
			if (!Contract.switch.measure) {
				return _('NO_SWITCH_MEASURE');
			}
			return undefined;
		},
		next: function() {
			return new Promise(function (resolve, reject) {
				MeasureValidator.validateMeasure(
					Contract.cups.cupsvalue,
					Contract.switch.date,
					Contract.switch.measure
				).then(function(data) {
					console.log('valid', data);
					resolve(true);
				}).catch(function(reason) {
					console.log('invalid', reason);
					Contract.switch.validationError = reason.validationError;
					reject(reason);
				});
			});
		},
		content: [
			m(Row, [
				m(Cell, {span:12}, _('FILL_SWITCH')),
				m(Cell, {span:6}, m(DatePicker, {
					id: 'switchdate',
					label: _('SWITCHDATE_LABEL'),
					help: _('SWITCHDATE_HELP'),
					autoclose: true,
					boxed: true,
					required: true,
					past: moment().add(-1,'years'),
					future: moment().add(1,'years'),
					value: Contract.switch.date,
					onchange: function(newvalue) {
						Contract.switch.date = newvalue;
						Contract.switch.validationError = false;
					},
				})),
				m(Cell, {span:6}, m(TextField, {
					id: 'switchmeasure',
					label: _('SWITCHMEASURE_LABEL'),
					help: _('SWITCHMEASURE_HELP'),
					boxed: true,
					inputfilter: /^\d*$/,
					required: true,
					value: Contract.switch.measure,
					oninput: function(ev) {
						Contract.switch.measure = ev.target.value;
						Contract.switch.validationError = false;
					},
				})),
			])
		]
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
