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

if (process.env.NODE_ENV !== 'ov_production') {
  Mousetrap.bindGlobal('ctrl+shift+y', function() {
	  showall = !showall;
	  m.redraw();
	  return false;
  });
}

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

var isLoading = false;
var SomApiAdapter = process.env.NODE_ENV === 'development' ? SomApi : SomApi;

var Contract = {
	supply_point: {
		verified: false,
	},
	holder: {

	},
	payment: {
		voluntary_cent: false
	},
	terms: {},
	member: {
		become_member: null,
		is_member: false,
		invite_token: false
	},
	especial_cases: {
		reason_death: false,
		reason_electrodep: false,
		reason_merge: false,
		attachments: {},
		attachments_errors: {},
	}
};


if (process.env.NODE_ENV !== 'ov_production') {
	Mousetrap.bindGlobal('ctrl+shift+1', function() {
		var newData = require('./data/data1.yaml');
		Object.keys(Contract).map(function(k) {
			if(typeof Contract[k] === 'object') {
				Object.assign(Contract[k], newData[k]);
			} else {
				Contract[k] = newData[k];
			}
		});
		m.redraw();
		return false;
	});
}

var Form = {};
Form.view = function(vn) {
  var component_list = [
		(process.env.NODE_ENV.match('ov') === null) ? m(TopAppBar, {
			title: _('CONTRACT_FORM_TITLE'),
			fixed: false
		}) : '',
		m(Steps, {
			showall: showall,
			focusonjump: true,
			nextonenter: true,
			className: (process.env.NODE_ENV.match('ov') === null) ? 'mdc-top-app-bar--fixed-adjust':'',
			loading: isLoading,
			pages:[
				IntroPage(),
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
	];

	if (process.env.NODE_ENV !== 'ov_production') {
	component_list.push(
			m(Inspector, {
			 shortcut: 'ctrl+shift+d',
				model: Contract,
			})
		);
	}
	return m(
		'.main.form.mdc-typography', {
			'autocomplete': 'off'
		}, [
			(process.env.NODE_ENV.match('ov') === null) ?
				m(TopAppBar, {
					title: _('CONTRACT_FORM_TITLE'),
					fixed: false
				}) : '',
			(process.env.NODE_ENV !== 'ov_production') ?
				m(Inspector, {
					shortcut: 'ctrl+shift+d',
					model: Contract,
				}) : '',
			m(Steps, {
				showall: showall,
				focusonjump: true,
				nextonenter: true,
				className: (process.env.NODE_ENV.match('ov') === null) ? 'mdc-top-app-bar--fixed-adjust':'',
				loading: isLoading,
				pages:[
					IntroPage(),
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
		],
	);
};

var IntroPage = function() {
	var intro = Contract.holder;
	return {
		id: 'intro_page',
		title: _('CONTRACT_FORM_TITLE'),
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
		skipif: function() { return true || model.vatexists!==true || model.sessionActive===true; },
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
			//return holder.vatexists === true;
			return false;
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
					autocomplete: 'off',
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
							value: true,
							label: _("VOLUNTARY_CENT_YES_LABEL"),
							description: _("VOLUNTARY_CENT_YES_DESCRIPTION"),
						},{
							value: false,
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

SomApi.postContract = function(data) {

		const ONLINE = 'ONLINE';
		const OFFLINE = 'OFFLINE';

		return new Promise(function(resolve, reject) {
			m.request({
				method: 'POST',
				url: `${process.env.APIBASE}/form/holderchange`,
				data: data
			})
			.then(function(response) {
				if (response.status === ONLINE) {
					resolve(response);
				} else if (response.status === OFFLINE) {
					reject(_('The backend server is offline'));
				} else {
					reject(_('Unexpected response'));
				}
			})
			.catch(function(reason) {
				console.log(_('Request postContract failed'), reason);
				if( reason.status !== undefined && reason.status == ONLINE && reason.state) {
					(reason.state !== undefined && reason.state === true) ? resolve(reason) : reject(reason);
				} else{
					reject(reason.message || _('Request failed'));
				}
			});
		});
};

SomMockupApi.postContract = function(contract) {
	var self = this;
	var promise = new Promise(function(accept, reject) {
		setTimeout(function() {
			if (contract.payment.voluntary_cent !== true) {
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

	function normalizeContract(contract){
		let normalizedContract = { ...contract };
		//let normalizedContract = Object.assign({}, contract);

		if(normalizedContract.supply_point.verified !== undefined) delete normalizedContract.supply_point.verified;
		if(normalizedContract.supply_point.status !== undefined) delete normalizedContract.supply_point.status;

		normalizedContract.holder.language !== undefined && normalizedContract.holder.language.code !== undefined ?
			normalizedContract.holder.language = normalizedContract.holder.language.code : false;
		normalizedContract.holder.state !== undefined && normalizedContract.holder.state.id !== undefined ?
			normalizedContract.holder.state = normalizedContract.holder.state.id : false;
		normalizedContract.holder.city !== undefined && normalizedContract.holder.city.id !== undefined ?
			normalizedContract.holder.city = normalizedContract.holder.city.id : false;
		if(normalizedContract.holder.vatvalue !== undefined ){
			normalizedContract.holder.vat = normalizedContract.holder.vatvalue;
			delete normalizedContract.holder.vatvalue;
			delete normalizedContract.holder.vatexists;
			delete normalizedContract.holder.vatvalid;
		}

		if(normalizedContract.holder.phone2 !== undefined && normalizedContract.holder.phone2 === ''){
			delete normalizedContract.holder.phone2;
		}

		
		if(normalizedContract.holder.proxyvatvalue !== undefined){
			normalizedContract.holder.proxynif = normalizedContract.holder.proxyvatvalue;
			delete normalizedContract.holder.proxyvatvalue;
		}	

		if(normalizedContract.holder.proxyvatvalid !== undefined){
			delete normalizedContract.holder.proxyvatvalid;
		}		

		if(normalizedContract.holder.privacy_policy_accepted !== undefined){
			normalizedContract.privacy_policy_accepted = normalizedContract.holder.privacy_policy_accepted;
			delete normalizedContract.holder.privacy_policy_accepted;
		}

		if(normalizedContract.holder.emailError !== undefined) delete normalizedContract.holder.emailError;
		if(normalizedContract.holder.postalcodeError !== undefined) delete normalizedContract.holder.postalcodeError;

		if(normalizedContract.member.become_member === undefined){
			 normalizedContract.member.is_member = true;
			 normalizedContract.member.become_member = false;
		}

		if(normalizedContract.payment.iban !== undefined){
			normalizedContract.payment.iban = normalizedContract.payment.iban.split(' ').join('');
		}

		normalizedContract.especial_cases !== undefined ? (
			Object.keys(normalizedContract.especial_cases).map(prop => prop.indexOf('reason') === 0 && normalizedContract.especial_cases[prop] === true)
				.reduce((prev, current) => !prev ? current : prev) ?
					false : (delete normalizedContract.especial_cases.attachments & delete normalizedContract.especial_cases.attachments_errors)
		) : false;

		if(normalizedContract.terms.terms_accepted !== undefined){
			normalizedContract.terms_accepted = normalizedContract.terms.terms_accepted;
			delete normalizedContract.terms;
		}

		return normalizedContract;
	}

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
			if (Contract.terms.terms_accepted === false) {
				return _('UNACCEPTED_TERMS');
			}
			return undefined;
		},
		content: [
			m(Row, {className: 'review'}, [
				m(Cell, {span:12}, m("a",{href: '#'}), _("REVIEW_DATA_AND_CONFIRM")),
				group(_('SUMMARY_GROUP_PROCESS'), [
					field(_("PROCESS_TYPE"), _("PROCESS_TYPE_HOLDER_CHANGE")),
					( Contract.especial_cases.reason_death || Contract.especial_cases.reason_electrodep || Contract.especial_cases.reason_merge ) ? field(_("SPECIAL_CASES_TITLE"), _("SPECIAL_CASES_DETAIL")) : '',
					isphisical(Contract.holder.vatvalue) &&
						field(_("RELATED_MEMBER"), ( Contract.member.become_member && Contract.member.become_member === true ? Contract.holder.name+" "+Contract.holder.surname1+" "+ (Contract.holder.surname2 ? Contract.holder.surname2:'') : _("RELATED_MEMBER_PENDING") ) ),
					!isphisical(Contract.holder.vatvalue) &&
						field(_("RELATED_MEMBER"), ( Contract.member.become_member && Contract.member.become_member === true ? Contract.holder.name : _("RELATED_MEMBER_PENDING") ) ),
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
							" ("+Contract.holder.proxyvatvalue+")"),
					field(_("ADDRESS"), Contract.holder.address),
					field(_("CITY"),
						(Contract.holder.city && Contract.holder.city.name)+
						" ("+Contract.holder.postal_code+") "+
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
					field(_("VOLUNTARY_CENT"), Contract.voluntary_cent === true ? _("YES"):_("NO")),
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
				let contract = normalizeContract(Contract);
				isLoading = true;
				SomApiAdapter.postContract(contract)
					.then(function(data) {
						// TODO: Save data into state
						Contract.contract_number = data.data.contract_number.name;
						isLoading = false;
						resolve('success_page');
					}).catch(function(reason) {
						isLoading = false;
						reason = (typeof reason === 'string') ? JSON.parse(reason) : undefined;
						postError = (reason.data.code !== undefined ) ? reason.data.code : undefined;
						postErrorData = (reason.data.msg !== undefined ) ? reason.data.msg : undefined;
						resolve('failure_page');
					});
			});
		},
	};
};

var SpecialCasesPage = function() {

	const attachmentsRequired = true;

	const uploadErrors = function(e){
		const errorCodes = {
			"INVALIDFORMAT" : _("INVALIDFORMAT"),
			"UPLOAD_MAX_SIZE" : _("UPLOAD_MAX_SIZE"),
		}
		return ( e.data !== undefined && e.data.code !== undefined &&  errorCodes[e.data.code] !== undefined ) ?
			_(e.code, e.data) : _("UPLOAD_UKNOWN_ERROR");
	};

	return {
		id: 'special_cases_page',
		title: _('SPECIAL_CASES_TITLE'),
		next: true,
		validator: function() {
			if ( (Contract.especial_cases.reason_electrodep === true
					&& ( Contract.especial_cases.attachments === undefined
					|| (Contract.especial_cases.attachments.medical === undefined
					&& Contract.especial_cases.attachments.resident === undefined )))
				|| Contract.especial_cases.reason_death === true
					&& ( Contract.especial_cases.attachments === undefined
						|| Contract.especial_cases.attachments.death === undefined)
				) {
					return _('ELECTRODEP_ATTACH_REQUIRED');
			}
			return undefined;
		},
		content: [
			m(Row, { className: 'special_cases_page' }, [
				m(Cell, {
						className: '',
						span: 12,
					},
					_('SPECIAL_CASES_QUESTION'),
				),
				[
					m(Cell, {span:12}, [
						m('.special_case__reason'
						+ (Contract.especial_cases.reason_death === true ? '.special_case__reason--selected':''), [
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
							]),
							(attachmentsRequired && Contract.especial_cases.reason_death === true ?
								m('.special_case__description', [
									m('p', m('b', _('CERT_ATTACH_DEATH')),[
										m('i.fa.fa-asterisk.red'),
										m(Uploader, {
											id: "electrodependent_death_report",
											name: "electrodependent_death_report",
											context: "contract",
											label: _("FILE_ACTION"),
											url: process.env.APIBASE + "/form/upload_attachment",
											max_file_size: 5,
											extensions: [".jpg",".jpeg",".pdf"],
											error: Contract.especial_cases.attachments_errors.death,
											onupload: function(response){

												Contract.especial_cases.attachments === undefined ? Contract.especial_cases.attachments = {} : false;
												Contract.especial_cases.attachments_errors === undefined ? Contract.especial_cases.attachments_errors = {} : false;

												if( response.data !== undefined && response.data.code !== undefined && response.data.code === 'UPLOAD_OK'){
													Contract.especial_cases.attachments.death = response.data.file_hash !== undefined ? response.data.file_hash : true ;
												} else {
													Contract.especial_cases.attachments.death = undefined;
													Contract.especial_cases.attachments_errors.death = uploadErrors(response);
												}
												m.redraw();
											},
											onclear: function(e){
												Contract.especial_cases.attachments === undefined ? Contract.especial_cases.attachments = {} : false;
												Contract.especial_cases.attachments.death = undefined;
											}
										})
									]),
								])
							: '')
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
						+ (Contract.especial_cases.reason_electrodep === true?'.special_case__reason--selected':'')
						+ (Contract.especial_cases.reason_merge === true?'.special_case__reason--disabled':'')
						, [
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
												max_file_size: 5,
												extensions: [".jpg",".jpeg",".pdf"],
												error: Contract.especial_cases.attachments_errors.medical,
												onupload: function(response){

													Contract.especial_cases.attachments === undefined ? Contract.especial_cases.attachments = {} : false;
													Contract.especial_cases.attachments_errors === undefined ? Contract.especial_cases.attachments_errors = {} : false;

													if( response.data !== undefined && response.data.code !== undefined && response.data.code === 'UPLOAD_OK'){
														Contract.especial_cases.attachments.medical = response.data.file_hash !== undefined ? response.data.file_hash : true ;
													} else {
														Contract.especial_cases.attachments.medical = undefined;
														Contract.especial_cases.attachments_errors.medical = uploadErrors(response);
													}
													m.redraw();
												},
												onclear: function(e){
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
												max_file_size: 5,
												extensions: [".jpg",".jpeg",".pdf"],
												onupload: function(response){
													Contract.especial_cases.attachments === undefined ? Contract.especial_cases.attachments = {} : false;
													Contract.especial_cases.attachments_errors === undefined ? Contract.especial_cases.attachments_errors = {} : false;

													if( response.data !== undefined && response.data.code !== undefined && response.data.code === 'UPLOAD_OK'){
														Contract.especial_cases.attachments.resident = response.data.file_hash !== undefined ? response.data.file_hash : true ;
													} else {
														Contract.especial_cases.attachments.resident = undefined;
														Contract.especial_cases.attachments_errors.resident = uploadErrors(response);
													}
													m.redraw();
												},
												onclear: function(e){
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

	const postErrorsMessages = function(code, msg){
		const errorCodes = {
			"INVALIDFORMAT" : _("INVALIDFORMAT"),
			"UPLOAD_MAX_SIZE" : _("UPLOAD_MAX_SIZE"),
		}
		return ( code !== undefined &&  errorCodes[code] !== undefined ) ?
			_(code, msg) : _("UNEXPECTED_POSTERROR", {code:code});
	};

	return {
		id: 'failure_page',
		title: _('FAILURE_TITLE'),
		next: false,
		content: [
			m(Row, { className: 'error_page' }, [
				m(Cell, { spandesktop:2, spantablet:1 }),
				m(Cell, { spandesktop:8, spantablet:6, className: '', align: 'center' }, [
					m.trust(_('FAILURE_TEXT')),
					m('.error', postErrorsMessages(postError, postErrorData)),
				]),
				m(Cell, { spandesktop:2, spantablet:1 })
			])
		]
	};
};

var SuccessPage = function() {
	return {
		id: 'success_page',
		title: _('SUCCESS_TITLE'),
		prev: false,
		next: false,
		content: [
			m(Row, { className: 'success_page' }, [
				m(Cell, { spandesktop:2, spantablet:1 }),
				m(Cell, { spandesktop:8, spantablet:6, className: '', align: 'center' }, [
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
