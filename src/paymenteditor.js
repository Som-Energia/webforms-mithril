'use strict';
var m = require('mithril');
var _ = require('./translate');
var Layout = require('./mdc/layout');
var Row = Layout.Row;
var Cell = Layout.Cell;
var ValidatedField = require('./validatedfield');
var Checkbox = require('./mdc/checkbox');

var PaymentEditor = {};

PaymentEditor.oninit = function(vn) {

    this.model=vn.attrs.model;
    this.model.iban = undefined;
    this.model.sepaaccepted = false;
    vn.state.ibaneditor = {};
    var self = this.model;

    this.model.validate = function() {

        if (vn.state.ibaneditor.isvalid !== true) {
            return _('INVALID_PAYER_IBAN');
        }
        if (self.sepaaccepted !== true) {
            return _('UNCONFIRMED_ACCOUNT_OWNER');
        }
        return undefined;
    };
};

PaymentEditor.onupdate = function(vn) {
    if(vn.attrs.model.iban !== undefined){
        vn.state.ibaneditor.value = vn.attrs.model.iban;
        vn.state.ibaneditor.isvalid = true;
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
			onvalidated: function() {
				console.log('payment editor, onvalidated: ', vn.state);
				vn.state.model.validate();
				vn.state.model.iban = vn.state.ibaneditor.value;
			},
        }),
        m(Checkbox, {
            id: 'sepaaccepted',
            label: _('IBAN_ACCEPT_DIRECT_DEBIT'),
            checked: vn.state.model.sepaaccepted,
            onchange: function(ev) {
                vn.state.model.sepaaccepted = ev.target.checked;
                vn.state.model.validate();
            },
        }),
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
