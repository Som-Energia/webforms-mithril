'use strict';
var m = require('mithril');
var _ = require('./translate');
var css = require('./style.styl');
var Wizard = require('./wizard');
var CheckBox = require('./mdc/checkbox');
var Layout = require('./mdc/layout');
var Row = Layout.Row;
var Cell = Layout.Cell;
var Card = require('./mdc/card');
var PersonEditor = require('./personeditor');
var PaymentEditor = require('./paymenteditor');
var IntroContract = require('./introcontract');
var Terms = require('./terms');
var LegalConsent = require('./legalconsent');
var LegalTexts = require('./legaltexts');
var TextField = require('./mdc/textfield');
var ValidatedField = require('./validatedfield');
var UserValidator = require('./uservalidator');
var DatePicker = require('./datepicker');
var Chooser = require('./chooser');
var moment = require('moment');
var jsyaml = require('js-yaml');
var cuca = require('./img/cuca-somenergia.svg');

var Mousetrap = require('mousetrap');
require('mousetrap-global-bind');
require('font-awesome/css/font-awesome.css');
require('@material/typography/dist/mdc.typography.css').default;
var Inspector = require('./inspector');

var showall = process.env.NODE_ENV === 'development';

// TODO: Duplicated function
function isphisical (vat) {
	if (vat === undefined) return undefined;
	var firstchar = vat[0];
	return '0123456789KLMXYZ'.indexOf(firstchar) !== -1;
}

Mousetrap.bindGlobal('ctrl+shift+y', function() {
	showall = !showall;
	m.redraw();
	console.log('showall', showall);
	return false;
});

var SomMockupApi = {};
SomMockupApi.validateMeasure = function(cups, date, measure) {
	var self = this;
	var promise = new Promise(function(accept, reject) {
		setTimeout(function() {
			if (date.day()===1) { // monday
				promise.catch(function() {m.redraw()});
				reject({
					validationError: 'TODO_ERROR_1',
				});
				return;
			}
			if (measure==='1') {
				promise.catch(function() {m.redraw()});
				reject({
					validationError: 'TODO_ERROR_2',
				});
				return;
			}
			promise.then(function() {m.redraw()});
			accept({
				status: 'ok',
			});
		}, UserValidator._mockPreValidationTimeoutMs);
	});
	return promise;
};


var Contract = {
	intro: {},
	cups: {
		cupsverified: false,
	},
	holder: {},
	payment: {},
	terms: {},
	voluntary_cent: false,
};

Mousetrap.bindGlobal('ctrl+shift+1', function() {
	var newData = require('./data/data1.yaml');
	console.log(newData);
	Object.keys(Contract).map(function(k) {
		if(typeof Contract[k] === 'object'){
			Object.assign(Contract[k], newData[k]);
		}else{
			Contract[k] = newData[k];
		}
		
	});
	m.redraw();
	return false;
});

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
				focusonjump: true,
				pages:[
					IntroPage(),
					PasswordPage(),
					CupsPage(),
					HolderPage(),
					//TermsPage(),
					VoluntaryCentPage(),
 					PaymentPage(),
					ReviewPage(),
					FailurePage(),
					SuccessPage(),
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
		prev: false,
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
					model.name = data.name;
					model.sessionActive = true; // TODO: maybe a session cookie?
					resolve(true);
				}).catch(function(reason) {
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
		skipif: function() {
			return intro.vatexists === true;
		},
		validator: function() {
			return holder.validate && holder.validate();
		},
		content: [
			m(PersonEditor, {
				id: 'holder',
				isphisical: isphisical(intro.vatvalue),
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

	if (model.cupsvalue){
		state.field.value = model.cupsvalue;
		if(model.cupsstatus === 'active') state.field.isvalid = true;

		state.field.data = {};
		state.field.data.cups = model.cupsvalue;
		if (model.cupsstatus) state.field.data.status = model.cupsvalue;
		if (model.cupsaddress) state.field.data.address = model.cupsaddress;
	}

	var showVerificationCheck = model.cupsaddress && (model.cupsstatus === 'active' || model.cupsstatus === 'inactive');

	return {
		id: 'cups_page',
		title: _('CUPS_TITLE'),
		validator: function() {
			if (model.cupsaddress === undefined) { // empty
				return ""; // Forbid going on, no message
			}
			if (model.cupsstatus === 'invalid' && state.field.isvalid === false) {
				return _('INVALID_SUPPLY_POINT_CUPS');
			}
			if (model.cupsstatus === 'busy') {
				return _('CUPS_IN_PROCESS');
			}
			if (model.cupsstatus !== 'active' && model.cupsstatus !== 'inactive') {
				// Should never get here
				return _('CUPS_STATE_UNEXPECTED')+" "+model.cupsstatus;
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

var VoluntaryCentPage = function() {
	return {
		id: 'voluntary_cent_page',
		title: _('VOLUNTARY_CENT_TITLE'),
		validator: function() {
			if (Contract.voluntary_cent === undefined)
				return  _("NO_VOLUNTARY_DONATION_CHOICE_TAKEN");
			return undefined;
		},
		content: [
			m(Row, [
				m(Cell, {span:12}, _("VOLUNTARY_CENT_PRESENTATION")),
				m(Cell, {span:12},
					m(Chooser, {
						id: 'voluntary_cent',
						question: _("VOLUNTARY_CENT_QUESTION"),
						required: true,
						value: Contract.voluntary_cent,
						onvaluechanged: function(newvalue){
							Contract.voluntary_cent = newvalue;
						},
						options: [{
							value: 'yes',
							label: _("VOLUNTARY_CENT_YES_LABEL"),
							description: _("VOLUNTARY_CENT_YES_DESCRIPTION"),
						},{
							value: 'no',
							label: _("VOLUNTARY_CENT_NO_LABEL"),
							description: _("VOLUNTARY_CENT_NO_DESCRIPTION"),
						}],
					})
				),
			])
		],
	};
};

var PaymentPage = function() {
	return {
		id: 'payment_page',
		title: _('PAYMENT_TITLE'),
		validator: function() {
			if (!Contract.payment.validate)
				return undefined;

			return Contract.payment.validate();
		},
		content: [
			m(PaymentEditor, {model: Contract.payment}),
		],
	};
};
var postError = undefined;
var postErrorData = undefined;

SomMockupApi.postContract = function(contract) {
	var self = this;
	var promise = new Promise(function(accept, reject) {
		setTimeout(function() {
			if (contract.voluntary_cent !== 'yes') {
				promise.catch(function() {m.redraw()})
				reject({
					failed: true,
					error_id: 'POSTERROR_GRASPER',
					data: {
						name: contract.holder.name,
					},
				});
				return;
			}
			console.log('simulated post');
			promise.then(function() {m.redraw()})
			accept({
				data: {
					contract_number: 666,
				}
			});
		}, UserValidator._mockPreValidationTimeoutMs);
	});

	return promise;
};

var ReviewPage = function() {
	function group(name, fields) {
		return m(Cell, {
			className: 'fieldgroup',
			span: 6,
		}, m('h4.fieldgroup_title',name), fields);
	}
	function field(name, value) {
		return m('.field', [
			m('b.fieldname', name),
			m('span.fieldvalue', value),
		]);
	}
	return {
		id: 'review_page',
		title: _('REVIEW_TITLE'),
		nexticon: 'send',
		nextlabel: _("SEND"),
		validator: function() {
			if (Contract.terms.termsaccepted !== true) {
				return _('UNACCEPTED_TERMS');
			}
			return undefined;
		},
		content: [
			m(Row, [
				m(Cell, {span:12}, _("REVIEW_DATA_AND_CONFIRM")),
				group(_('SUMMARY_GROUP_PROCESS'), [
					field(_("PROCESS_TYPE"), _("PROCESS_TYPE_HOLDER_CHANGE")),
					field(_("RELATED_MEMBER"), _("RELATED_MEMBER_PENDING")),
				]),
				group(_('SUPPLY'), [
					field(_("CUPS"), Contract.cups.cupsvalue),
					field(_("ADDRESS"), Contract.cups.cupsaddress),
				]),
				group(_("HOLDER"), [
					field(_("NIF"), Contract.intro.vatvalue),
					isphisical(Contract.intro.vatvalue) &&
						field(_("NAME"), Contract.holder.name+" "+Contract.holder.surname1+" "+Contract.holder.surname2),
					!isphisical(Contract.intro.vatvalue) &&
						field(_("LEGAL_NAME"), Contract.holder.name),
					!isphisical(Contract.intro.vatvalue) &&
						field(_("PROXY"), Contract.holder.proxyname+
							  " ("+Contract.holder.proxyvat+")"),
					field(_("ADDRESS"), Contract.holder.address),
					field(_("CITY"),
						  (Contract.holder.city && Contract.holder.city.name)+
						  " ("+Contract.holder.postalcode+") "+
						  (Contract.holder.state && Contract.holder.state.name)),
				]),
				group(_('CONTACT'), [
					field(_("PHONE"), Contract.holder.phone1 + (Contract.holder.phone2 ? (" / " + Contract.holder.phone2) : "")),
					field(_("EMAIL"), Contract.holder.email),
					field(_("LANGUAGE"), Contract.holder.language && Contract.holder.language.name),
				]),
				group(_('SUMMARY_GROUP_TECHNICAL'), [
					field(_("FARE"), _("FARE_SAME")),
					field(_("POWER"), _("POWER_SAME")),
					m('p.field .mdc-text-field-helper-text'+
						'.mdc-text-field-helper-text--persistent'+						
						'', {
						'aria-hidden': true,
						},
						_('FARE_POWER_CHANGE_NOTE')
					),
				]),
				group(_('SUMMARY_GROUP_PAYMENT'), [
					field(_("IBAN"), Contract.payment.iban),
					field(_("VOLUNTARY_CENT"), Contract.voluntary_cent === 'yes' ? _("YES"):_("NO")),
				]),
			]),
			m(Row, [
				m(Cell, {span:12}, m(LegalConsent, {
					id: 'accept-terms',
					accepted: typeof Contract.terms.termsaccepted === 'undefined' ? false : Contract.terms.termsaccepted,
					onchanged: function(value) {
						Contract.terms.termsaccepted = value;
					},
					label: m.trust(_('ACCEPT_TERMS', {
						url: _('ACCEPT_TERMS_URL')
					})),
					title: _('TERMS_TITLE'),
					required: true,
				},
					m.trust(LegalTexts.get('generalterms', _('LANGKEY')))
				)),
			]),			
		],
		next: function() {
			return new Promise(function (resolve, reject) {
				SomMockupApi.postContract(Contract)
					.then(function(data) {
						// TODO: Save data into state
						Contract.contract_number = data.data.contract_number;
						resolve('success_page');
					}).catch(function(reason) {
						postError = reason.error_id;
						postErrorData = reason.data;
						// TODO: Save reason into state
						resolve('failure_page');
					});
			});
		},
	};
};

var FailurePage = function() {
	var translatedError = _(postError, postErrorData);
	var unexpectedError = translatedError === postError;
	return {
		id: 'failure_page',
		title: '',
		next: false,
		content: [
			m('.error_page', [
				m(Card, [
					m('h2', _('FAILURE_TITLE')),
					m('', _('FAILURE_TEXT')),
					unexpectedError && m('.error', _("UNEXPECTED_POSTERROR", {code:postError})),
					unexpectedError && postErrorData && m('pre.error', jsyaml.dump(postErrorData)),
					!unexpectedError && m('.error', translatedError),	
				]),
			]),
		],
	};
};

var SuccessPage = function() {
	return {
		id: 'success_page',
		title: '',
		prev: false,
		next: false,
		content: [
			m('.success_page', [				
				m(Card,[
					m('h2', _('SUCCESS_TITLE')),
					m.trust(_('SUCCESS_TEXT', {
						contract_number: Contract.contract_number,
						urlov: _('OV_URL'),
					})),
					m('img', {src: cuca})
				])
			 ]),
		],
	};
};

window.onload = function() {
	var element = document.getElementById("mithril-target");
	m.mount(element, Form);
};
// vim: noet ts=4 sw=4
