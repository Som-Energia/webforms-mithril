'use strict';
var m = require('mithril');
var _ = require('./translate');
var Layout = require('./mdc/layout');
var Row = Layout.Row;
var Cell = Layout.Cell;
var ValidatedField = require('./validatedfield');
var Checkbox = require('./mdc/checkbox');
var LegalConsent = require('./legalconsent');
var LegalTexts = require('./legaltexts');

var PaymentEditor = {};

PaymentEditor.oninit = function(vn) {

    vn.state.model=vn.attrs.model;
    vn.state.model.iban = undefined;
    vn.state.model.sepa_accepted = false;
    vn.state.ibaneditor = {};

    vn.state.model.validate = function() {
        if (vn.state.ibaneditor.isvalid !== true) {
            return _('INVALID_PAYER_IBAN');
        }
        if (vn.state.model.sepa_accepted !== true) {
            return _('UNCONFIRMED_ACCOUNT_OWNER');
        }
        return undefined;
    };
};

PaymentEditor.onupdate = function(vn) {
    if(vn.attrs.model.iban !== undefined){
        vn.state.ibaneditor.value = vn.attrs.model.iban;
        //vn.state.ibaneditor.isvalid = true;
    }
};

PaymentEditor.view = function(vn){
    return m('.paymenteditor', [
        m(ValidatedField, {
            id: 'iban',
            label: _('IBAN_LABEL'),
            help: _('IBAN_HELP'),
            defaulterror: _('IBAN_ERROR'),
            required: true,
            maxlength: 29,
            inputfilter: function(value) {
                if (!value) return value;
                // Separate it in 4 chunks
                value=value.toUpperCase();
                value=value.split(' ').join('');
                value=value.match(/.{1,4}/g).join(' ');
                return value;
            },
            checkurl: '/check/iban/',
            fieldData: vn.state.ibaneditor,
            boxed: true,
            outlined: true,
            autocomplete: 'off',
			onvalidated: function() {
				vn.state.model.validate();
				vn.state.model.iban = vn.state.ibaneditor.value;
			},
        }),
        m(LegalConsent, {
            id: 'sepa_accepted',
            accepted: vn.state.model.sepa_accepted,
            onchanged: function(value) {
                vn.state.model.sepa_accepted = value;
                vn.state.model.validate();
            },
            label: m.trust(_('IBAN_ACCEPT_DIRECT_DEBIT', {
                url: _('IBAN_ACCEPT_DIRECT_DEBIT_URL')
            })),
            title: _('TERMS_TITLE'),
            required: true,
        },
            m.trust(LegalTexts.get('generalterms', _('LANGKEY')))
        ),
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
		m('h2', 'Payment Editor'),
	]);
};

PaymentEditor.Example = Example;
module.exports = PaymentEditor;

// vim: noet ts=4 sw=4
