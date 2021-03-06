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
var LegalTexts = require('./legaltexts');
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

	person.privacy_policy_accepted = false;

	person.validate = function() {

		if (!this.name) {
			return _('NO_NAME');
		}

		if (vn.state.isphisical) {
			if (!this.surname1) {
				return _('NO_SURNAME1');
			}
		}
		else {
			if (!this.proxyname) {
				return _('NO_PROXY_NAME');
			}

			if (this.proxyvatvalue === undefined) {
				return _('NO_PROXY_NIF');
			} else if (this.proxyvatvalid !== true) {
				return _('INVALID_PROXY_NIF');
			}
		}
		if (!this.address) {
			return _('NO_ADDRESS');
		}
		if (!this.postal_code || this.postalcodeError) {
			return _('NO_POSTALCODE');
		}
		if (this.state === undefined) {
			return _('NO_STATE');
		}
		if (this.city === undefined) {
			return _('NO_CITY');
		}

		if (!this.email || this.emailError) {
			return _('NO_EMAIL');
		}
		if (!this.email2 || this.email !== this.email2) {
			return _('NO_REPEATED_EMAIL');
		}
		if (!this.phone1) {
			return _('NO_PHONE');
		}
		if (this.language === undefined) {
			return _('NO_LANGUAGE');
		}
		if (this.privacy_policy_accepted !== true) {
			return _('UNACCEPTED_PRIVACY_POLICY');
		}
	};
};


PersonEditor.view = function(vn) {
	var id = vn.attrs.id;
	var prefix = id ? id + '_' : '';
	vn.state.isphisical = vn.attrs.isphisical;
	var person = vn.state.person;
	return m('.personeditor', {
		id: id,
		validator: function() {
			return person.validate();
		},
	}, [
		m(Row, [
			m(Cell, {span:4}, m(TextField, {
				id: prefix+'name',
				label: vn.attrs.isphisical ? _('HOLDER_NAME') : _('BUSINESS_NAME'),
				help: '', //help: vn.attrs.isphisical ? _('HOLDER_NAME_HELP') : _('BUSINESS_NAME_HELP'),
				value: person.name,
				oninput: function(ev) {
					person.name = ev.target.value;
				},
				required: true,
				boxed: true,
				outlined: true,
			})),
			vn.attrs.isphisical ? [
				m(Cell, {span:4}, m(TextField, {
					id: prefix+'surname1',
					label: _('HOLDER_SURNAME1'),
					help: '', //help: _('HOLDER_SURNAME1_HELP'),
					value: person.surname1,
					oninput: function(ev) {
						person.surname1 = ev.target.value;
					},
					required: true,
					boxed: true,
					outlined: true,
				})),
				m(Cell, {span:4}, m(TextField, {
					id: prefix+'surname2',
					label: _('HOLDER_SURNAME2'),
					help: '', //help: _('HOLDER_SURNAME2_HELP'),
					value: person.surname2,
					oninput: function(ev) {
						person.surname2 = ev.target.value;
					},
					required: false,
					boxed: true,
					outlined: true,
				}))	] : [
				m(Cell, {span:4}, m(TextField, {
					id: prefix+'proxyname',
					label: _('PROXY_NAME'),
					help: '', //help: _('PROXY_NAME_HELP'),
					value: person.proxyname,
					oninput: function(ev) {
						person.proxyname = ev.target.value;
					},
					required: true,
					boxed: true,
					outlined: true,
				})),
				m(Cell, {span:4}, m(ValidatedField, {
					id: prefix+'proxyvat',
					checkurl: '/check/vat/exists/',
					label: _('PROXY_NIF'),
					help: '', //help: _('PROXY_NIF_HELP'),
					boxed: true,
					required: true,
					maxlength: 9,
					fieldData: vn.state.proxyvateditor,
					outlined: true,
					inputfilter: function(value) {
						if (!value) return value;
						if (!/^[0-9A-Za-z]{0,9}$/.test(value)) return false;
						return value.toUpperCase();
					},
					onvalidated: function(value, data) {
						if (value) {
							vn.state.person.proxyvatvalue = value;
							vn.state.person.proxyvatvalid = isphisical(value) ? data.valid : false;
						} else {
							vn.state.person.proxyvatvalue = undefined;
							vn.state.person.proxyvatvalid = false;
						}
					}
				}))]
		]),
		m(Row, [
			m(Cell, {span:8}, m(TextField, {
				id: prefix+'address',
				label: _('HOLDER_ADDRESS'),
				help: '', //help: _('HOLDER_ADDRESS_HELP'),
				leadingicon: 'home',
				value: person.address,
				oninput: function(ev) {
					person.address = ev.target.value;
				},
				required: true,
				boxed: true,
				outlined: true,
			})),
			m(Cell, {span:4}, m(TextField, {
				id: prefix+'postalcode',
				label: _('HOLDER_POSTALCODE'),
				help: '', //help: _('HOLDER_POSTALCODE_HELP'),
				value: person.postal_code,
				maxlength: 5,
				minlength: 5,
				pattern: '[0-9]{5}',
				oninput: function(ev) {
					person.postal_code = ev.target.value;
					person.postalcodeError = ev.target.validationMessage;
				},
				inputfilter: /^[0-9]{0,5}$/,
				required: true,
				boxed: true,
				outlined: true,
			})),
		]),
		m(StateCityChooser, {
			statevalue: (person.state !== undefined) ? person.state.id : undefined,
			cityvalue: (person.city !== undefined) ? person.city.id : undefined,
			outlined: true,
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
			m(Cell, {spandesktop:6, spantablet:4}, m(TextField, {
				id: prefix+'email',
				label: _('HOLDER_EMAIL'),
				help: '', //help: _('HOLDER_EMAIL_HELP'),
				type: 'email',
				leadingicon: 'email',
				required: true,
				value: person.email,
				outlined: true,
				oninput: function(ev) {
					person.email = ev.target.value;
					person.emailError = ev.target.validationMessage;
					// TODO var emailRE = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
				},
				boxed: true,
			})),
			m(Cell, {spandesktop:6, spantablet:4}, m(TextField, {
				id: prefix+'email2',
				label: _('HOLDER_EMAIL_2'),
				help: '', //help: _('HOLDER_EMAIL_2_HELP'),
				type: 'email',
				leadingicon: 'email',
				required: true,
				value: person.email2,
				outlined: true,
				oninput: function(ev) {
					person.email2 = ev.target.value;
				},
				boxed: true,
			})),
		]),
		m(Row, [
			m(Cell, {spandesktop:6, spantablet:4}, m(TextField, {
				id: prefix+'phone1',
				label: _('HOLDER_PHONE'),
				help: '', //help: _('HOLDER_PHONE_HELP'),
				minlength: 9,
				maxlength: 9,
				pattern: '[0-9]{9}',
				leadingicon: 'phone',
				value: person.phone1,
				outlined: true,
				oninput: function(ev) {
					person.phone1 = ev.target.value;
				},
				inputfilter: /^[0-9]{0,9}$/,
				required: true,
				boxed: true,
			})),
			m(Cell, {spandesktop:6, spantablet:4}, m(TextField, {
				id: prefix+'phone2',
				label: _('HOLDER_PHONE_2'),
				help: '', //help: _('HOLDER_PHONE_2_HELP'),
				maxlength: 9,
				pattern: '[0-9]{9}',
				leadingicon: 'phone',
				value: person.phone2,
				outlined: true,
				oninput: function(ev) {
					person.phone2 = ev.target.value;
				},
				inputfilter: /^[0-9]{0,9}$/,
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
			value: (person.language !== undefined) ? person.language.code : false,
			faicon: 'language',
			help: _('HOLDER_LANGUAGE_HELP'),
			required: true,
			outlined: true,
		}),
		m(Row, [
			m(Cell, {span:12, className:'legalconsent'}, m(LegalConsent, {
				id: prefix+'acceptprivacypolicy',
				accepted: person.privacy_policy_accepted,
				onchanged: function(value) {
					person.privacy_policy_accepted = value;
				},
				label: m.trust(_('ACCEPT_PRIVACY_POLICY', {
					url: _('ACCEPT_PRIVACY_POLICY_URL')})),
				title: _('PRIVACY_POLICY_TITLE'),
				required: true,
			},
				m.trust(LegalTexts.get('privacypolicy', _('LANGKEY')))
			)),
		]),
	]);
};

PersonEditor.oncreate = function(vn) {
	Mousetrap(vn.dom).bindGlobal('ctrl+shift+1', function() {
		var person = vn.state.person;
		person.name='Perico';
		person.surname='Palotes';
		person.address='Percebe 13';
		person.postal_code='12345';
		person.phone1='123456789';
		person.phone2='987654321';
		person.email ='a@a';
		person.email2='a@a';
		m.redraw();
		return false;
	});
	Mousetrap(vn.dom).bindGlobal('ctrl+shift+2', function() {
		var person = vn.state.person;
		person.name='Juana';
		person.surname='Calamidad';
		person.address='Calle Mayor';
		person.postal_code='54321';
		person.phone1='123456789';
		person.phone2='987654321';
		person.email ='b@b';
		person.email2='b@a';
		person.privacy_policy_accepted=false;
		m.redraw();
		return false;
	});
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
