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
var Mousetrap = require('mousetrap');
require('mousetrap-global-bind');

function TokenRetriever() {
	var self = this;
	self.token = m.parseQueryString(location.search).token || false;
	self.loading = false;
	self.data = false;
	self.error = false;
	if (!self.token) { return; }
	self.loading = true;
	m.request({
		method: 'GET',
		url: 'http://localhost:5001/data/token/:token',
		data: {
			token: self.token,
		},
	}).then(function(response) {
		self.loading = false;
		if (response.state !== true) {
			self.error = response.data.error;
			self.errorDescription = response.data.description;
			return;
		}
		self.tokendata=response.data;
	});
};

var IntroContract = {};

IntroContract.oninit = function(vn) {
	vn.state.model = vn.attrs.model || {};
	var model = vn.state.model;
	model.vat = {};
	model.cups = {};
	model.tokenretriever = new TokenRetriever();
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

IntroContract.statechanged = function(vn) {
	
};
IntroContract.view = function(vn) {
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

/*
			model.tokenretriever.token?(
			model.tokenretriever.loading?
				m('', _('Loading information')):
			model.tokenretriever.error?
				m('', _('Error loading information "%{error}": %{errorDescription}',
					model.tokenretriever)):
			[]):[],
*/
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
					console.log('CUPS',state);
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
	]);
};

const Example = {};

Example.Persona0 = {
};
Example.Persona1 = {
};
Example.Persona2 = {
};

Example.oncreate = function(vn) {
};
Example.view = function(vn) {
	const Layout = require('./mdc/layout');
	return m(Layout, [
		m('h2', 'Person Editor'),
		m('h3', 'Persona0'),
		m(IntroContract, {id: 'p0'}, {
			onvaluechanged: function(model) {
				Object.assign(Example.Persona0, model);
			},
		}),
		m('.red', this.Persona0.error),
		m('pre', JSON.stringify(this.Persona0, null, 2)),
		m('h3', 'Persona1'),
		m(IntroContract, {id: 'p1', model: this.Persona1}),
		m('.red', this.Persona1.error),
		m('pre', JSON.stringify(this.Persona1, null, 2)),
		m('h3', 'Persona2'),
		m(IntroContract, {id: 'p2', model: this.Persona2}),
		m('.red', this.Persona2.error),
		m('pre', JSON.stringify(this.Persona2, null, 2)),
	]);
};

IntroContract.Example = Example;
module.exports = IntroContract;

// vim: noet ts=4 sw=4
