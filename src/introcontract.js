'use strict';
var m = require('mithril');
var _ = require('./translate');
var Layout = require('./mdc/layout');
var Row = Layout.Row;
var Cell = Layout.Cell;
var Button = require('./mdc/button');
var Select = require('./mdc/select');
var Checkbox = require('./mdc/checkbox');
var TextField = require('./mdc/textfield');
var ValidatedField = require('./validatedfield');
var LanguageChooser = require('./languagechooser');
var UserValidator = require('./uservalidator');
var Mousetrap = require('mousetrap');
require('mousetrap-global-bind');

var IntroContract = {};
/* states */
const checkingSession     = 'checkingSession';
const welcomeExistingUser = 'welcomeExistingUser';
const askDni              = 'askDni';
const checkDniExist       = 'checkDniExist';
const welcomeNewUser      = 'welcomeNewUser';
const askPassword         = 'askPassword';
const checkingPassword    = 'checkingPassword';

IntroContract.oninit = function(vn) {
	vn.state.model = vn.attrs.model || {};
	vn.state.state = checkingSession;
	UserValidator.isValidated().then(function (data) {
		vn.state.state = welcomeExistingUser;
		model.name = data.name;
	}, function (reason) {
		vn.state.state = askDni;
	});

	var model = vn.state.model;
	model.vat = {};
	model.cups = {};
	model.login = function() {
		m.request({
			method: 'GET',
			url: 'http://cas.somenergia.local:8000/login',
			withCredentials: true,
			extract: function(xhr) {
				console.log(xhr.getResponseHeader('Set-Cookie'));
			},
		})
		.then(function(result) {
			console.log(result);
		})
		.catch(function(reason) {
			console.log('Query failed', reason);
		});
	};
	model.privacypolicyaccepted=false;
	model.isphisical = function() {
		if (this.vat===undefined) return undefined;
		if (this.vat.value===undefined) return undefined;
		var firstchar = this.vat.value[0];
		return '0123456789KLMXYZ'.indexOf(firstchar) !== -1;
	};
	model.validate = function() {
		var self = this;
		function error(message) {
			if (self.error !== message) {
				self.error = message;
			}
			return false;
		}
		if (!this.vat.isvalid) {
			return error('NO_NIF');
		}
		if (!this.cups.isvalid) {
			return error('NO_CUPS');
		}
		this.error = undefined;
		return true;
	};
	model.vat = {data: {}};
};
IntroContract.oncreate = function(vn) {
	Mousetrap(vn.dom).bindGlobal('ctrl+shift+1', function() {
		var model = vn.state.model
		model.vat.value = '12345678z';
		model.vat.isvalid = true;
		model.name='Perico';
		model.surname='Palotes';
		model.address='Percebe 13';
		model.postalcode='12345';
		model.phone1='123456789';
		model.phone2='987654321';
		model.email ='a@a';
		model.email2='a@a';
		m.redraw();
		return false;
	});
	Mousetrap(vn.dom).bindGlobal('ctrl+shift+2', function() {
		var model = vn.state.model
		model.vat.value = '87654321x';
		model.vat.isvalid = true;
		model.name='Juana';
		model.surname='Calamidad';
		model.address='Calle Mayor';
		model.postalcode='54321';
		model.phone1='123456789';
		model.phone2='987654321';
		model.email ='b@b';
		model.email2='b@a';
		model.privacypolicyaccepted=false;
		m.redraw();
		return false;
	});
};

IntroContract.view = function(vn) {
	console.debug('view state', vn.state);
	return (
		vn.state.state === checkingSession ?
			m('.mdc-typograpy--button',
			{style: {width:'100%', 'text-align': 'center'}},
			_('Validating session...')) : (
		vn.state.state === welcomeExistingUser ?
			m('.mdc--elevation-6', _(
				'Hola %{name}. Wellcome to Som Energia contract form. '+
				'Proceed to enter the CUPS number of the installation.'
				, vn.state.model)) : (
		vn.state.state === askDni ?
			m(Row, [
				m(Cell, {span:12}, 
					_('Wellcome to Som Energia electricity contract form. ')
				),
				m(Cell, {span:6}, m(ValidatedField, {
					id: 'vat',
					checkurl: '/check/vat/exists/',
					label: _('NIF'),
					boxed: true,
					required: true,
					maxlength: 9,
					fieldData: vn.state.model.vat,
					inputfilter: function(value) {
						if (!value) return value;
						value=value.toUpperCase();
						value=value.replace(/[^0-9A-Z]/g,'');
						return value.slice(0,9);
					},
					fieldData: vn.state.model.vat,
					onvalidated: function() {

					}
				})),
				m(Cell, {span:6}, m(Button, {
					raised: true,
					disabled: vn.state.model.vat.isvalid!==true,
					onclick: function() {
						vn.state.state = (vn.state.model.vat.data.exists===true)?
							askPassword : welcomeNewUser;
					},
				}, _('Next'))),
			]):
		vn.state.state === askPassword ?
			m(Row, [
				m(Cell, {span:6}, m(TextField, {
					label: _('Password'),
					leadingfaicon: 'key',
					type: 'password',
					boxed: true,
					oninput: function(ev) {
						vn.state.model.password = ev.target.value
					},
				})),
				m(Cell, {span:4}, m(Button, {
					unelevated: true,
					onclick: function(ev) {
						var validationPromise = UserValidator.validate(
							vn.state.model.vat.value,
							vn.state.model.password);
						validationPromise.then(function(data) {
							vn.state.state = welcomeExistingUser;
							vn.state.model.name = data.name;
						});
						validationPromise.catch(function (error) {
							console.debug('TODO: manage validation errores');
						});
					},
				},_('Login'))),
			]) :
		m('', vn.state.state)
		))
	);
/*
	var id=vn.attrs.id;
	var prefix=id?id+'_':'';
	var model = vn.state.model;
	var passwordRequired = (
		model.vat.isvalid===true &&
		model.vat.exists===true &&
		true);

	var detailsRequired = (
		model.vat.isvalid===true &&
		model.vat.exists!==true &&
		true);
	return m('.personeditor', {
		id: id,
		validator: function() {
			model.validate();
			return model.error;
		},
	},[
*/
/*
			model.tokenretriever.token?(
			model.tokenretriever.loading?
				m('', _('Loading information')):
			model.tokenretriever.error?
				m('', _('Error loading information "%{error}": %{errorDescription}',
					model.tokenretriever)):
			[]):[],
*/
/*
		m(Row, [
			m(Cell, {span:12},
				m('.intro',_('CONTRACT_INTRO')),
			)
		]),
		m(Row, [
			m(Cell, {span:12},
				m('h2', _('Identifica el titular del nou contracte'))
			)
		]),
		m(Row, [
			m(Cell, {span:6}, m(ValidatedField, {
				id: 'vat',
				checkurl: '/check/vat/exists/',
				label: _('NIF'),
				boxed: true,
				required: true,
				maxlength: 9,
				fieldData: model.vat,
				inputfilter: function(value) {
					if (!value) return value;
					value=value.toUpperCase();
					value=value.replace(/[^0-9A-Z]/g,'');
					return value.slice(0,9);
				},
				fieldData: model.vat,
				onvalidated: function() {
				}
			})),
			m(Cell, {span:6}, m(TextField, {
				label: _('Password'),
				leadingfaicon: 'key',
				type: 'password',
				boxed: true,
			})),
			m(Cell, {span:4}, m(Button, {
				unelevated: true,
				onclick: function(ev) {
					model.login();
				},
			},_('Login'))),
		]),
		m(Row, [
			m(Cell, {span:12},
				m('h2', _('Identifica el punt de subministrament'))
			)
		]),
		m(Row, [
			m(Cell, {span:6}, m(ValidatedField, {
				id: 'cups',
				checkurl: '/check/cups/status/',
				label: _('Supply point identifier (CUPS)'),
				help: _('"ES" followed by 16 numbers and two check letters'),
				boxed: true,
				required: true,
				maxlength: 24,
				fieldData: model.cups,
				inputfilter: function(value) {
					return value.toUpperCase();
				},
				onvalidated: function(state) {
					console.log('CUPS');
				}
			})),
			m(Cell, {span:6}, m(TextField, {
				id: 'cupsaddress',
				label: _('Supply point address'),
				help: _(''),
				boxed: true,
				disabled: true,
				required: true,
				maxlength: 24,
				value: (model.cups.data && model.cups.isvalid || '') && model.cups.data.address,
			})),

		]),
	]);*/
};

module.exports = IntroContract;

// vim: noet ts=4 sw=4
