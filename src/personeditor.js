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
var StateCityChooser = require('./statecity');
var LanguageChooser = require('./languagechooser');
var LegalConsent = require('./legalconsent');
var Mousetrap = require('mousetrap');
require('mousetrap-global-bind');


function isphisical (vat) {
	if (vat === undefined) return undefined;
	var firstchar = vat[0];
	return '0123456789KLMXYZ'.indexOf(firstchar) !== -1;
}

var PersonEditor = {};

PersonEditor.oninit = function(vn) {
	vn.state.person = vn.attrs.model || {};
	var person = vn.state.person;

	person.privacypolicyaccepted = false;

	person.isphisical = function() {
		if (vn.attrs.vat === undefined) return undefined;
		var firstchar = vn.attrs.vat[0];
		return '0123456789KLMXYZ'.indexOf(firstchar) !== -1;
	};

	person.validate = function() {
		var self = this;
		function error(message) {
			if (self.error !== message) {
				self.error = message;
			}
			return false;
		}
		this.usertype = isphisical(vn.attrs.vat) ? 'person' : 'company';

		// TODO: Obsolete
		if (this.usertype === undefined) {
			return error('NO_PERSON_TYPE');
		}
		if (!this.name) {
			return error('NO_NAME');
		}
		if (isphisical(vn.attrs.vat)) {
			if (!this.surname) {
				return error('NO_SURNAME');
			}
		}
		// TODO:  This is not implemented yet
		if (isphisical(vn.attrs.vat) === false) {
			if (this.representantname === undefined) {
				return error('NO_PROXY_NAME');
			}
			if (this.representantdni === undefined ||
				this.dniRepresentantIsInvalid !== false) {
				return error('NO_PROXY_NIF');
			}
		}
		if (!this.address) {
			return error('NO_ADDRESS');
		}
		if (!this.postalcode || this.postalcodeError) {
			return error('NO_POSTALCODE');
		}
		if (this.state === undefined) {
			return error('NO_STATE');
		}
		if (this.city === undefined) {
			return error('NO_CITY');
		}

		if (!this.email || this.emailError) {
			return error('NO_EMAIL');
		}
		if (!this.email2 || this.email !== this.email2) {
			return error('NO_REPEATED_EMAIL');
		}
		if (!this.phone1) {
			return error('NO_PHONE');
		}
		if (this.language === undefined) {
			return error('NO_LANGUAGE');
		}
		if (this.privacypolicyaccepted !== true) {
			return error('UNACCEPTED_PRIVACY_POLICY');
		}
		this.error = undefined;
		return true;
	};
};
PersonEditor.oncreate = function(vn) {
	Mousetrap(vn.dom).bindGlobal('ctrl+shift+1', function() {
		var person = vn.state.person
		person.name='Perico';
		person.surname='Palotes';
		person.address='Percebe 13';
		person.postalcode='12345';
		person.phone1='123456789';
		person.phone2='987654321';
		person.email ='a@a';
		person.email2='a@a';
		m.redraw();
		return false;
	});
	Mousetrap(vn.dom).bindGlobal('ctrl+shift+2', function() {
		var person = vn.state.person
		person.name='Juana';
		person.surname='Calamidad';
		person.address='Calle Mayor';
		person.postalcode='54321';
		person.phone1='123456789';
		person.phone2='987654321';
		person.email ='b@b';
		person.email2='b@a';
		person.privacypolicyaccepted=false;
		m.redraw();
		return false;
	});
};

PersonEditor.statechanged = function(vn) {
};
PersonEditor.view = function(vn) {
	var id = vn.attrs.id;
	var prefix = id ? id + '_' : '';
	var person = vn.state.person;
	return m('.personeditor', {
		id: id,
		validator: function() {
			person.validate();
			return person.error;
		},
	},[
		m(Row, [
			isphisical(vn.attrs.vat) ? [
				m(Cell, {span:5}, m(TextField, {
					id: prefix+'name',
					label: _('Name'),
					value: person.name,
					oninput: function(ev) {
						person.name = ev.target.value;
					},
					required: true,
					boxed: true,
				})),
				m(Cell, {span:7}, m(TextField, {
					id: prefix+'surname',
					label: _('Surname'),
					value: person.surname,
					oninput: function(ev) {
						person.surname = ev.target.value;
					},
					required: true,
					boxed: true,
				}))
			]:[
				m(Cell, {span:4}, m(TextField, {
					id: prefix+'proxyname',
					label: _('Proxy Name'),
					value: person.proxyname,
					oninput: function(ev) {
						person.proxyname = ev.target.value;
					},
					required: true,
					boxed: true,
				})),
				m(Cell, {span:4}, m(ValidatedField, {
					id: prefix+'proxyvat',
					checkurl: '/check/vat/exists/',
					label: _('Proxy Nif'),
					help: _('Nif de la persona representant'),
					boxed: true,
					required: true,
					maxlength: 9,
					fieldData: vn.state.proxyvateditor,
					inputfilter: function(value) {
						if (!value) return value;
						value=value.toUpperCase();
						value=value.replace(/[^0-9A-Z]/g,'');
						return value.slice(0,9);
					},
					onvalidated: function(value, data) {
						if (value) {
							vn.state.model.proxyvatvalue = value;
							vn.state.model.proxyvatvalid = data.valid;
							// TODO: Ensure is physical
						} else {
							vn.state.model.proxyvatvalue = undefined;
							vn.state.model.proxyvatvalid = false;
						}
					}
				}))
			],
		]),
		m(Row, [
			m(Cell, {span:8}, m(TextField, {
				id: prefix+'address',
				label: _('Street address'),
				leadingfaicon: 'home',
				value: person.address,
				oninput: function(ev) {
					person.address = ev.target.value;
				},
				required: true,
				boxed: true,
			})),
			m(Cell, {span:4}, m(TextField, {
				id: prefix+'postalcode',
				label: _('Postal code'),
				value: person.postalcode,
				maxlength: 5,
				minlength: 5,
				pattern: '[0-9]{5}',
				oninput: function(ev) {
					person.postalcode = ev.target.value;
					person.postalcodeError = ev.target.validationMessage;
				},
				inputfilter: function(value) {
					value = value.replace(/[^0-9]/,'');
					value = value.slice(0,5);
					return value;
				},
				help: m.trust('&nbsp;'),
				required: true,
				boxed: true,
			})),
		]),
		m(StateCityChooser, {
			onvaluechanged: function(chooser) {
				person.state = chooser.states.find(function(v) {
					return v.id==chooser.state;
				});
				person.city = chooser.cities.find(function(v) {
					return v.id==chooser.city;
				});
			},
		}),
		m(Row, [
			m(Cell, {span:6}, m(TextField, {
				id: prefix+'email',
				label: _('e-mail'),
				type: 'email',
				leadingfaicon: 'envelope',
				value: person.email,
				oninput: function(ev) {
					person.email = ev.target.value;
					person.emailError = ev.target.validationMessage;
					// TODO var emailRE = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
				},
				help: _('This address will identify you'),
				boxed: true,
			})),
			m(Cell, {span:6}, m(TextField, {
				id: prefix+'email2',
				label: _('e-mail (repeat)'),
				type: 'email',
				leadingfaicon: 'envelope',
				value: person.email2,
				oninput: function(ev) {
					person.email2 = ev.target.value;
				},
				help: _('Repeat the e-mail address to be sure'),
				boxed: true,
			})),
		]),
		m(Row, [
			m(Cell, {span:6}, m(TextField, {
				id: prefix+'phone1',
				label: _('Phone'),
				maxlength: 9,
				leadingfaicon: 'phone',
				value: person.phone1,
				oninput: function(ev) {
					person.phone1 = ev.target.value;
				},
				inputfilter: function(value) {
					value = value.replace(/[^0-9]/g,'');
					return value;
				},
				required: true,
				boxed: true,
			})),
			m(Cell, {span:6}, m(TextField, {
				id: prefix+'phone2',
				label: _('Additional phone (optional)'),
				maxlength: 9,
				leadingfaicon: 'phone',
				value: person.phone2,
				oninput: function(ev) {
					person.phone2 = ev.target.value;
				},
				inputfilter: function(value) {
					value = value.replace(/[^0-9]/g,'');
					return value;
				},
				boxed: true,
			})),
		]),
		m(LanguageChooser, {
			id: prefix+'lang',
			onvaluechanged: function(chooser) {
				person.language = chooser.languages.find(function(v) {
					return v.code==chooser.language;
				});
			},
			help: _('Choose the language we will address you'),
			required: true,
		}),
		m(Row, [
			m(Cell, {span:12}, m(Checkbox, {
				id: prefix+'privacypolicy',
				label: m.trust(_('ACCEPT_PRIVACY_POLICY', {
					url: _('ACCEPT_PRIVACY_POLICY_URL')})),
				checked: person.privacypolicyaccepted,
				onchange: function(ev) {
					person.privacypolicyaccepted = ev.target.checked;
				},
				required: true,
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
		m(PersonEditor, {id: 'p0'}, {
			onvaluechanged: function(person) {
				Object.assign(Example.Persona0, person);
			},
		}),
		m('.red', this.Persona0.error),
		m('pre', JSON.stringify(this.Persona0, null, 2)),
		m('h3', 'Persona1'),
		m(PersonEditor, {id: 'p1', model: this.Persona1}),
		m('.red', this.Persona1.error),
		m('pre', JSON.stringify(this.Persona1, null, 2)),
		m('h3', 'Persona2'),
		m(PersonEditor, {id: 'p2', model: this.Persona2}),
		m('.red', this.Persona2.error),
		m('pre', JSON.stringify(this.Persona2, null, 2)),
	]);
};

PersonEditor.Example = Example;
module.exports = PersonEditor;

// vim: noet ts=4 sw=4
