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
    this.model.iban = {};
    this.model.sepaaccepted = false;
    this.model.error = undefined;
    var self = this.model;

    this.model.validate = function() {
        function error(message) {
            if (self.error !== message) {
                self.error = message;
            }
            return false;
        }

        self.error = undefined;
        // Recover self code if we add other payers than holder
        /*
        if ($scope.form.choosepayer === cfg.PAYER_TYPE_OTHER) {
            if ($scope.payer.isReady === undefined) {
                return false; // Just initializing
            }
            if ($scope.payer.isReady()!==true) {
                return error($scope.payer.error);
            }
        }
        if ($scope.form.choosepayer !== cfg.PAYER_TYPE_TITULAR) {
            if ($scope.form.payerAcceptsGeneralConditions !== true) {
                return error('UNACCEPTED_GENERAL_CONDITIONS_NON_OWNER_PAYER');
            }
        }
        */
        if (self.iban.isvalid !== true) {
            return error('INVALID_PAYER_IBAN');
        }
        if (self.sepaaccepted !== true) {
            return error('UNCONFIRMED_ACCOUNT_OWNER');
        }
		// TODO: activate when we add the voluntarydonation widget
		/*
        if (self.voluntarydonation === undefined) {
            return error('NO_VOLUNTARY_DONATION_CHOICE_TAKEN');
        }
		*/
        return true;
    };

};

PaymentEditor.view = function(vn){
    return m('.paymenteditor', [
        m(ValidatedField, {
            id: 'iban',
            label: _('IBAN (compte bancari)'),
            help: _('Un com aquest: ES77 1234 1234 1612 3456 7890'),
            defaulterror: _('Invalid IBAN'),
            required: true,
            maxlength: 29,
            inputfilter: function(value) {
                if (!value) return value;
                // Separate it in 4 chunks
                value=value.toUpperCase();
                value=value.split(' ').join('');
                value=value.match(/.{1,4}/g).join(' ');
                return value
            },
            checkurl: '/check/iban/',
            fieldData: this.model.iban,
            boxed: true,
			onvalidated: function() {
				vn.state.model.validate();
			},
        }),
        m(Checkbox, {
            id: 'sepaaccepted',
            label: _('CONFIRMO_TITULAR_COMPTE_ACCEPTA_DOMICILIACIO'),
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
