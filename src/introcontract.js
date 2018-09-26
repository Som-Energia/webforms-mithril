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
require('@material/elevation/dist/mdc.elevation.css');

/** @module */

/**
@class
*/
var IntroContract = {};


/* states */
const checkingSession     = 'checkingSession';
const welcomeExistingSession = 'welcomeExistingSession';
const askDni              = 'askDni';

IntroContract.oninit = function(vn) {
	vn.state.model = vn.attrs.model || {};
	var model = vn.state.model;

	vn.state.state = checkingSession;
	UserValidator.isSessionOpen().then(function (data) {
		console.log('checked session open');
		vn.state.state = welcomeExistingSession;
		model.name = data.name;
		model.validatedNif = data.nif;
		m.redraw();
	}, function (reason) {
		vn.state.state = askDni;
	});

	model.vateditor = {data: {}};
	model.isphisical = function() {
		if (model.vateditor===undefined) return undefined;
		if (model.vateditor.value===undefined) return undefined;
		var firstchar = model.vateditor.value[0];
		return '0123456789KLMXYZ'.indexOf(firstchar) !== -1;
	};
	model.validationErrors = function() {
		if (vn.state.state === checkingSession) {
			return _('STILL_VALIDATING_SESSION'); // TODO: Translate
		}
		if (vn.state.state === welcomeExistingSession) {
			return undefined;
		}
		if (model.vateditor.isvalid !== true) {
			return _('NO_NIF');
		}
		return undefined;
	};
};

IntroContract.view = function(vn) {
	return m(Row, [
		vn.state.state === checkingSession ? [
			m(Cell, {span:12}, [
				m('', _('VALIDATING_SESSION')),
			])
		] : (
		vn.state.state === welcomeExistingSession ?  [
			m(Cell, {span:12}, [
				m('', _('CONTRACTING_AS', vn.state.model)),
				m('', m.trust(_('NOT_YOU_LOGOUT', {url:'TODO'}))),
			]),
		] : (
		vn.state.state === askDni ? [
			m(Cell, {span:12}, 
				_('FILL_VAT')
			),
			m(Cell, {span:6}, m(ValidatedField, {
				id: 'vat',
				checkurl: '/check/vat/exists/',
				label: _('VAT'),
				boxed: true,
				required: true,
				maxlength: 9,
				fieldData: vn.state.model.vateditor,
				inputfilter: function(value) {
					if (!value) return value;
					value=value.toUpperCase();
					value=value.replace(/[^0-9A-Z]/g,'');
					return value.slice(0,9);
				},
				onvalidated: function() {
					console.log('onvalidate', vn.state.model.vateditor);
				}
			})),
		] :
		m('', vn.state.state)
		)),
	]);
};

module.exports = IntroContract;

// vim: noet ts=4 sw=4
