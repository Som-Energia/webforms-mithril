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
require('@material/elevation/dist/mdc.elevation.css');

var IntroContract = {};
/* states */
const checkingSession     = 'checkingSession';
const welcomeExistingUser = 'welcomeExistingUser';
const askDni              = 'askDni';
const welcomeNewUser      = 'welcomeNewUser';

IntroContract.oninit = function(vn) {
	vn.state.model = vn.attrs.model || {};
	var model = vn.state.model;

	vn.state.state = checkingSession;
	UserValidator.isSessionOpen().then(function (data) {
		console.log('checked session open');
		vn.state.state = welcomeExistingUser;
		model.name = data.name;
		model.validatedNif = data.nif;
		m.redraw();
	}, function (reason) {
		vn.state.state = askDni;
	});

	model.vat = {data: {}};
	model.isphisical = function() {
		if (this.vat===undefined) return undefined;
		if (this.vat.value===undefined) return undefined;
		var firstchar = this.vat.value[0];
		return '0123456789KLMXYZ'.indexOf(firstchar) !== -1;
	};
	model.validate = function() {
		var self = this;
		function error(message) {
			self.error = message;
			return self.error===undefined;
		}

		if (vn.state.state === checkingSession) {
			return error('STILL_VALIDATING_SESSION'); // TODO: Translate
		}
		if (vn.state.state === welcomeExistingUser) {
			return error(undefined);
		}
		if (!self.vat.isvalid) {
			return error('NO_NIF');
		}
		return error(undefined);
	};
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
	return m(Row, [
		vn.state.state === checkingSession ? [
			m(Cell, {span:12}, [
				m('', _('Validating session...')),
			])
		] : (
		vn.state.state === welcomeExistingUser ?  [
			m(Cell, {span:12}, [
				m('', _('You are now contracting as: %{name}.', vn.state.model)),
				m('', m.trust(_('If you are not that person, please <a href="TODO">logout</a>'))),
			]),
		] : (
		vn.state.state === askDni ? [
			m(Cell, {span:12}, 
				_('Please introduce the VAT number for the new contract holder:')
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
		] :
		m('', vn.state.state)
		)),
	]);
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
