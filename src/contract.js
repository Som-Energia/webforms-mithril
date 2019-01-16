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
var Chooser = require('./chooser');
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
	closure: {
		method: 'regular',
	},
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
					ClosurePage(),
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
	var showVerificationCheck = model.cupsaddress && (model.cupsstatus === 'active' || model.cupsstatus === 'inactive');

	return {
		id: 'cups_page',
		title: _('CUPS_TITLE'),
		validator: function() {
			if (model.cupsaddress === undefined) { // empty
				return true; // Forbid advancing, no message
			}
			if (model.cupsstatus === 'invalid' && state.field.isvalid === false) {
				return _('INVALID_SUPPLY_POINT_CUPS');
			}
			if (model.cupsstatus === 'busy') {
				return _('CUPS_IN_PROCESS');
			}
			if (model.cupsstatus !== 'active' && model.cupsstatus !== 'inactive') {
				// Should never get here
				return _('CUPS_STATE_INEXPECTED');
			}
			// TODO: Should be removed as soon as we implement more than holder changes
			if (model.cupsstatus !== 'active') {
				return _('CUPS_SHOULD_BE_ACTIVE');
			}
			if (model.cupsverified === false) {
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
						model.cupsverified = false; //cups edited
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
				m(Cell, {span:12, style: showVerificationCheck||'visibility:hidden'}, m(CheckBox, {
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


var ClosurePage = function() {
	var hideInputs = Contract.closure.method!=='given';
	return {
		id: 'closure_page',
		title: _('CONTRACT_CLOSURE_TITLE'),
		skipif: function(){
			return Contract.cups.cupsstatus !== 'active';
		},
		validator: function() {
			if (Contract.closure.validationError) {
				return _(Contract.closure.validationError);
			}
			if (!Contract.closure.method) {
				return _('NO_CLOSURE_PROCEDURE');
			}
			if (Contract.closure.method==='given') {
				if (!Contract.closure.date) {
					return _('NO_CLOSURE_DATE');
				}
				if (!Contract.closure.measure) {
					return _('NO_CLOSURE_MEASURE');
				}
			}
			return undefined;
		},
		next: function() {
			if (Contract.closure.method==='regular') {
				return true;
			}
			return new Promise(function (resolve, reject) {
				MeasureValidator.validateMeasure(
					Contract.cups.cupsvalue,
					Contract.closure.date,
					Contract.closure.measure
				).then(function(data) {
					console.log('valid', data);
					resolve(true);
				}).catch(function(reason) {
					console.log('invalid', reason);
					Contract.closure.validationError = reason.validationError;
					reject(reason);
				});
			});
		},
		content: [
			m(Row, [
				m(Cell, {span:12},
					m(Chooser, {
						id: 'method',
						question: _("WHICH_CLOSURE_METHOD"),
						required: true,
						value: Contract.closure.method,
						onvaluechanged: function(newvalue){
							Contract.closure.validationError = false;
							Contract.closure.method = newvalue;
						},
						options: [{
							value: 'regular',
							label: _("AT_REGULAR_INVOICING_LABEL"),
							description: _("AT_REGULAR_INVOICING_DESCRIPTION"),
						},{
							value: 'given',
							label: _("AT_A_GIVEN_DATE_LABEL"),
							description: _("AT_A_GIVEN_DATE_LABEL_DESCRIPTION"),
						}],
					})
				),
				m(Cell, {span:12, style: hideInputs&&'visibility:hidden'}, _('FILL_CLOSURE_FIELDS')),
				m(Cell, {span:2, spantablet:6, style: hideInputs&&'visibility:hidden'}, m(DatePicker, {
					id: 'closuredate',
					label: _('CLOSURE_DATE_LABEL'),
					help: _('CLOSURE_DATE_HELP'),
					autoclose: true,
					boxed: true,
					required: Contract.closure.method,
					disabled: !Contract.closure.method,
					past: moment().add(-2,'months'),
					future: moment(),
					value: Contract.closure.date,
					onchange: function(newvalue) {
						Contract.closure.date = newvalue;
						Contract.closure.validationError = false;
					},
				})),
				m(Cell, {span:2, spantablet:6, style: hideInputs&&'visibility:hidden'}, m(TextField, {
					id: 'closuremeasure',
					label: _('CLOSURE_MEASURE_LABEL'),
					help: _('CLOSURE_MEASURE_HELP'),
					boxed: true,
					required: Contract.closure.method,
					disabled: !Contract.closure.method,
					inputfilter: /^\d*$/,
					value: Contract.closure.measure,
					oninput: function(ev) {
						Contract.closure.measure = ev.target.value;
						Contract.closure.validationError = false;
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
