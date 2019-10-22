'use strict';
var m = require('mithril');
var _ = require('./translate');
var css = require('./style.styl');
var Wizard = require('./wizard');
var Steps = require('./steps');
var CheckBox = require('./mdc/checkbox');
var Layout = require('./mdc/layout');
var Row = Layout.Row;
var Cell = Layout.Cell;
var TopAppBar = require('./mdc/topappbar');
var PersonEditor = require('./personeditor');
var PaymentEditor = require('./paymenteditor');
var IntroContract = require('./introcontract');
var Terms = require('./terms');
var Member = require('./member');
var LegalConsent = require('./legalconsent');
var LegalTexts = require('./legaltexts');
var TextField = require('./mdc/textfield');
var ValidatedField = require('./validatedfield');
var UserValidator = require('./uservalidator');
var DatePicker = require('./datepicker');
var Chooser = require('./chooser');
var Uploader = require('./uploader');
var moment = require('moment');
var jsyaml = require('js-yaml');
var cuca = require('./img/cuca-somenergia.svg');

var Mousetrap = require('mousetrap');
require('mousetrap-global-bind');
require('font-awesome/css/font-awesome.css');
require('webpack-roboto/sass/roboto.scss');
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

var SomApi = {};
SomApi.validateMeasure = function(cups, date, measure) {
	SomMockupApi.validateMeasure(cups, date, measure);
};

var SomApiAdapter = process.env.NODE_ENV === 'development' ? SomApi : SomApi;

var Contract = {
	supply_point: {
		verified: false,
	},
	holder: {},
	payment: {
		voluntary_cent: false
	},
	terms: {},
	member: {
		become_member: false,
	},
	especial_cases: {
		attachments: {},
		attachments_errors: {},
	}
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
	return m('.main.form.mdc-typography', [
		m(Inspector, {
			shortcut: 'ctrl+shift+d',
			model: Contract,
		}),
		m(TopAppBar, {
			title: _('CONTRACT_FORM_TITLE'),
			fixed: false
		}),
		m(Steps, {
			showall: showall,
			focusonjump: true,
			nextonenter: true,
			className: 'mdc-top-app-bar--fixed-adjust',
			pages:[
				IntroPage(),
				PasswordPage(),
				CupsPage(),
				HolderPage(),
				MemberPage(),
				VoluntaryCentPage(),
				SpecialCasesPage(),
				PaymentPage(),
				ReviewPage(),
				FailurePage(),
				SuccessPage(),
			],
		}),
	]);
};

var IntroPage = function() {
	var intro = Contract.holder;
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
	var model = Contract.holder;
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
			m(Cell, {span:6}, m(TextField, {
				label: _('PASSWORD_LABEL'),
				leadingicon: 'vpn_key',
				type: 'password',
				boxed: true,
				outlined: true,
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
	var holder = Contract.holder;
	return {
		id: 'holder_page',
		title: _('HOLDER_PERSONAL_DATA'),
		skipif: function() {
			return holder.vatexists === true;
		},
		validator: function() {
			return holder.validate && holder.validate();
		},
		content: [
			m(PersonEditor, {
				id: 'holder',
				isphisical: isphisical(holder.vatvalue),
				model: holder,
			}),
		],
	};
};

var CupsContract ={};

CupsContract.field = {};

var CupsPage = function() {

	var model = Contract.supply_point;
	var state = CupsContract;

	if (model.cups){
		state.field.value = model.cups;
		if(model.status === 'active') state.field.isvalid = true;

		state.field.data = {};
		state.field.data.cups = model.cups;
		if (model.status) state.field.data.status = model.cups;
		if (model.address) state.field.data.address = model.address;
	}

	var showVerificationCheck = model.address && (model.status === 'active' || model.status === 'inactive');

	return {
		id: 'cups_page',
		title: _('CUPS_TITLE'),
		validator: function() {
			if (model.address === undefined) { // empty
				return ""; // Forbid going on, no message
			}
			if (model.status === 'invalid' && state.field.isvalid === false) {
				return _('INVALID_SUPPLY_POINT_CUPS');
			}
			if (model.status === 'busy') {
				return _('CUPS_IN_PROCESS');
			}
			if (model.status !== 'active' && model.status !== 'inactive') {
				// Should never get here
				return _('CUPS_STATE_UNEXPECTED')+" "+model.status;
			}
			// TODO: Should be removed as soon as we implement more than holder changes
			if (model.status !== 'active') {
				return _('CUPS_SHOULD_BE_ACTIVE');
			}
			if (model.verified === false) {
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
					outlined: true,
					inputfilter: function(value) {
						model.verified = false; //cups edited
						return value.toUpperCase();
					},

					onvalidated: function(value, data) {
						if (value) {
							model.cups = value;
							model.address = data.address;
							model.status = data.status;
						} else {
							model.cups = undefined;
							model.address = undefined;
							model.status = 'invalid';
						}
					},
				}))
			]),
			m(Row, [
				m(Cell, {span:6}, [
					m(TextField, {
						id: 'cupsaddress',
						label: _('SUPPLY_POINT_ADDRESS'),
						help: (state.field.data && state.field.isvalid)?
							m.trust(_('CUPS_PARTIAL_ADDRESS_NOTICE')):'',
						boxed: true,
						disabled: true,
						tabindex: -1,
						required: true,
						maxlength: 24,
						outlined: true,
						value: (state.field.data && state.field.isvalid)?
							state.field.data.address:'',
					})
				]),
				m(Cell, {span:12, style: showVerificationCheck||'visibility:hidden'},
					[
						m(CheckBox, {
							id: 'cups_verify',
							label: _('CUPS_VERIFY_LABEL'),
							checked: model.verified,
							onchange: function(ev){
								model.verified = ev.target.checked;
							}
						}),
					]
				),
				m(Cell, {span:12, style: !model.verified||'visibility:hidden'},
					[
						m('p.field .mdc-text-field-helper-text'+
							'.mdc-text-field-helper-text--persistent'+
							'', {
							'aria-hidden': true,
							},
							m.trust(_('CUPS_NO_VERIFY_HELP'))
						)
					]
				)
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

var MemberPage = function() {
	return {
		id: 'become_member_page',
		title: _('BECOME_MEMBER_TITLE'),
		skipif: function() {
			return (Contract.member.is_member !== undefined && Contract.member.is_member !== false)
				|| (Contract.member.invite_token !== undefined && Contract.member.invite_token !== false);
		},
		validator: function(){
			Contract.member.validate &&
				Contract.member.validate();
			return Contract.member.error;
		},
		content: [
			m(Member, {model: Contract.member}),
		]
	}
};

var VoluntaryCentPage = function() {
	return {
		id: 'voluntary_cent_page',
		title: _('VOLUNTARY_CENT_TITLE'),
		validator: function() {
			if (Contract.payment.voluntary_cent === undefined)
				return  _("NO_VOLUNTARY_DONATION_CHOICE_TAKEN");
				if (Contract.payment.voluntary_cent === false)
					return false;
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
						value: Contract.payment.voluntary_cent,
						onvaluechanged: function(new_value){
							Contract.payment.voluntary_cent = new_value;
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

SomApi.postContract = function(contract) {
	return m.request({
        method: "POST",
        url: `${process.env.APIBASE}/form/holderchange`,
        data: contract,
    });
};

SomMockupApi.postContract = function(contract) {
	var self = this;
	var promise = new Promise(function(accept, reject) {
		setTimeout(function() {
			if (contract.payment.voluntary_cent !== 'yes') {
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
			className: 'fieldgroup ',
			spandesktop: 6,
			spantablet: 4,
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
			if (Contract.terms.terms_accepted !== true) {
				return _('UNACCEPTED_TERMS');
			}
			return undefined;
		},
		content: [
			m(Row, {className: 'review'}, [
				m(Cell, {span:12}, m("a",{href: '#'}), _("REVIEW_DATA_AND_CONFIRM")),
				group(_('SUMMARY_GROUP_PROCESS'), [
					field(_("PROCESS_TYPE"), _("PROCESS_TYPE_HOLDER_CHANGE")),
					m('p.field .mdc-text-field-helper-text .mdc-text-field-helper-text--persistent',{'aria-hidden': true}, _('SPECIAL_CASE')),
					field(_("RELATED_MEMBER"), ( Contract.member.become_member && Contract.member.become_member == 'yes' ? Contract.holder.name+" "+Contract.holder.surname1+" "+ (Contract.holder.surname2 ? Contract.holder.surname2:'') : _("RELATED_MEMBER_PENDING") ) ),
				]),
				group(_('SUPPLY'), [
					field(_("CUPS"), Contract.supply_point.cups),
					field(_("ADDRESS"), Contract.supply_point.address),
				]),
				group(_("HOLDER"), [
					field(_("NIF"), Contract.holder.vatvalue),
					isphisical(Contract.holder.vatvalue) &&
						field(_("NAME"), Contract.holder.name+" "+Contract.holder.surname1+" "+ (Contract.holder.surname2 ? Contract.holder.surname2:'')),
					!isphisical(Contract.holder.vatvalue) &&
						field(_("LEGAL_NAME"), Contract.holder.name),
					!isphisical(Contract.holder.vatvalue) &&
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
					m('p.field .mdc-text-field-helper-text .mdc-text-field-helper-text--persistent', {'aria-hidden': true},	_('FARE_POWER_CHANGE_NOTE')	),
				]),
				group(_('SUMMARY_GROUP_PAYMENT'), [
					field(_("IBAN"), Contract.payment.iban),
					field(_("VOLUNTARY_CENT"), Contract.voluntary_cent === 'yes' ? _("YES"):_("NO")),
				]),
			]),
			m(Row, [
				m(Cell, {span:12, className:'legalconsent'}, m(LegalConsent, {
					id: 'accept-terms',
					accepted: typeof Contract.terms.terms_accepted === 'undefined' ? false : Contract.terms.terms_accepted,
					onchanged: function(value) {
						Contract.terms.terms_accepted = value;
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

				var pContract =  Object.assign({}, Contract);
				pContract.holder.language !== undefined && pContract.holder.language.code !== undefined ?
					pContract.holder.language = pContract.holder.language.code : false;
				pContract.holder.state !== undefined && pContract.holder.state.id !== undefined ?
					pContract.holder.state = pContract.holder.state.id : false;
				pContract.holder.city !== undefined && pContract.holder.city.id !== undefined ?
					pContract.holder.city = pContract.holder.city.id : false;


				SomApiAdapter.postContract(Contract)
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

var SpecialCasesPage = function() {

	const attachmentsRequired = true;

	return {
		id: 'special_cases_page',
		title: _('SPECIAL_CASES_TITLE'),
		next: true,
		validator: function() {
			if ( attachmentsRequired && Contract.especial_cases.reason_electrodep === true
				&& ( Contract.especial_cases.attachments === undefined
					|| Contract.especial_cases.attachments.medical === undefined
					|| Contract.especial_cases.attachments.resident === undefined )
				) {
				return _('ELECTRODEP_ATTACH_REQUIRED');
			}
			return undefined;
		},
		content: [
			m(Row, { className: 'special_cases_page' }, [
				m(Cell, {
						className: 'special_cases__question',
						span: 12,
					},
					_('SPECIAL_CASES_QUESTION'),
				),
				[
					m(Cell, {span:12}, [
						m('.special_case__reason'
						+ (Contract.especial_cases.reason_death === true?'.special_case__reason--selected':''), [
							m('label.special_case__lbl', [
								m(CheckBox, {
									id: 'reason_defuncio',
									label: _('SPECIAL_CASES_REASON_DEATH'),
									checked: (Contract.especial_cases.reason_death === true),
									onchange: function(ev) {
										Contract.especial_cases.reason_death = ev.target.checked;
										Contract.especial_cases.reason_merge = false;
									}
								})
							])
						])
					]),
					m(Cell, {span:12}, [
						m('.special_case__reason'
						+ (Contract.especial_cases.reason_merge === true?'.special_case__reason--selected':''), [
							m('label.special_case__lbl', [
								m(CheckBox, {
									id: 'reason_merge',
									label: _('SPECIAL_CASES_REASON_MERGE'),
									checked: (Contract.especial_cases.reason_merge === true),
									onchange: function(ev) {
										Contract.especial_cases.reason_merge = ev.target.checked;
										Contract.especial_cases.reason_death = false;
										Contract.especial_cases.reason_electrodep = false;
									}
								})
							])
						])
					]),
					m(Cell, {span:12}, [
						m('.special_case__reason'
						+ (Contract.especial_cases.reason_electrodep === true?'.special_case__reason--selected':''), [
							m('label.special_case__lbl', [
								m(CheckBox, {
									id: 'reason_electrodep',
									label: _('SPECIAL_CASES_REASON_ELECTRODEP'),
									checked: (Contract.especial_cases.reason_electrodep === true),
									disabled: (Contract.especial_cases.reason_merge === true),
									onchange: function(ev) {
										Contract.especial_cases.reason_electrodep = ev.target.checked;
										if(!ev.target.checked){
											Contract.especial_cases.attachments = undefined;
										}
									}
								})
							]),
							(attachmentsRequired && Contract.especial_cases.reason_electrodep === true ?
								m('.special_case__description', [
										m('p', m('b', _('ELECTRODEP_ATTACH_MEDICAL')),[
											m('i.fa.fa-asterisk.red'),
											m(Uploader, {
												id: "electrodependent_medical_report",
												name: "electrodependent_medical_report",
												context: "contract",
												label: _("FILE_ACTION"),
												url: process.env.APIBASE + "/form/upload_attachment",
												//url: "https://www.mocky.io/v2/5185415ba171ea3a00704eed?mocky-delay=500ms",
												max_file_size: 5,
												extensions: [".jpg",".png",".gif",".pdf"],
												error: Contract.especial_cases.attachments_errors.medical,
												onupload: function(response){
													const uploadErrors = function(e){
														const errorCodes = {
															"INVALIDFORMAT" : _("INVALIDFORMAT"),
															"UPLOAD_MAX_SIZE" : _("UPLOAD_MAX_SIZE"),
														}
														return ( e.code !== undefined &&  errorCodes[e.code] !== undefined ) ?
															_(e.code, e.data) : _("UPLOAD_UKNOWN_ERROR");
													};

													Contract.especial_cases.attachments === undefined ? Contract.especial_cases.attachments = {} : false;
													Contract.especial_cases.attachments_errors === undefined ? Contract.especial_cases.attachments_errors = {} : false;

													if( response.code !== undefined && response.code === 'UPLOAD_OK'){
														Contract.especial_cases.attachments.medical = response.file_hash !== undefined ? response.file_hash : true ;
														//Contract.especial_cases.attachments_errors.medical = undefined;
													} else {
														Contract.especial_cases.attachments.medical = undefined;
														Contract.especial_cases.attachments_errors.medical = uploadErrors(response);
													}
													//Contract.especial_cases.attachments.medical = (e.filename !== undefined ? e.filename : undefined);
													m.redraw();
												},
												onclear: function(e){
													console.log('onclear!');
													Contract.especial_cases.attachments === undefined ? Contract.especial_cases.attachments = {} : false;
													Contract.especial_cases.attachments.medical = undefined;
												}
											})
										]),
										m('p', m('b',_('ELECTRODEP_ATTACH_RESIDENT')),[
											m('i.fa.fa-asterisk.red'),
											m(Uploader, {
												id: "electrodependent_residence_certificate",
												name: "electrodependent_residence_certificate",
												label: _("FILE_ACTION"),
												url: process.env.APIBASE + "/form/upload_attachment",
												//url: "https://www.mocky.io/v2/5185415ba171ea3a00704eed?mocky-delay=500ms",
												max_file_size: 5,
												extensions: [".jpg",".png",".gif",".pdf"],
												onupload: function(e){
													console.log(e);
													Contract.especial_cases.attachments === undefined ? Contract.especial_cases.attachments = {} : false;
													Contract.especial_cases.attachments.resident = (e.filename !== undefined ? e.filename : undefined);
													Contract.especial_cases.attachments.resident = 'resident_filename.pdf';
												},
												onclear: function(e){
													console.log('onclear!');
													Contract.especial_cases.attachments === undefined ? Contract.especial_cases.attachments = {} : false;
													Contract.especial_cases.attachments.resident = undefined;
												}
											})
										]),
								]) : '')
						])
					])
				]
			])
		]
	}
};

var FailurePage = function() {
	var translatedError = _(postError, postErrorData);
	var unexpectedError = translatedError === postError;
	return {
		id: 'failure_page',
		title: '',
		next: false,
		content: [
			m(Row, { className: 'error_page' }, [
				m(Cell, { spandesktop:2, spantablet:1 }),
				m(Cell, { spandesktop:8, spantablet:6, className: '', align: 'center' }, [
					m('h2', _('FAILURE_TITLE')),
					m.trust(_('FAILURE_TEXT')),
					unexpectedError && m('.error', _("UNEXPECTED_POSTERROR", {code:postError})),
					unexpectedError && postErrorData && m('pre.error', jsyaml.dump(postErrorData)),
					!unexpectedError && m('.error', translatedError),
				]),
				m(Cell, { spandesktop:2, spantablet:1 })
			])
		]
	};
};

var SuccessPage = function() {
	return {
		id: 'success_page',
		title: '',
		prev: false,
		next: false,
		content: [
			m(Row, { className: 'success_page' }, [
				m(Cell, { spandesktop:2, spantablet:1 }),
				m(Cell, { spandesktop:8, spantablet:6, className: '', align: 'center' }, [
					m('h2', _('SUCCESS_TITLE')),
					m.trust(_('SUCCESS_TEXT', {
						contract_number: Contract.contract_number,
						urlov: _('OV_URL'),
					})),
					m('img.cuca', {src: cuca})
				]),
				m(Cell, { spandesktop:2, spantablet:1 })
			])
		]
	};
};


window.onload = function() {
	var element = document.getElementById("mithril-target");
	m.mount(element, Form);
};
// vim: noet ts=4 sw=4
