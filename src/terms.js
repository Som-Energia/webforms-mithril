'use strict';
var m = require('mithril');
var _ = require('./translate');
var css = require('./style.styl');
var Wizard = require('./wizard');
var Layout = require('./mdc/layout');
var Row = Layout.Row;
var Cell = Layout.Cell;
var Chooser = require('./chooser');
var FarePower = require('./farepower');

const Terms = {};
Terms.oninit = function (vn) {
	vn.state.model = vn.attrs.model || {};
	vn.state.model.alta = undefined;
	vn.state.model.holderchanges = undefined;
	vn.state.model.bysurrogation = undefined;
	vn.state.model.farepower = {};
	vn.state.model.validate = function() {
		vn.state.model.error=undefined;
		function error(message) {
			vn.state.model.error = message;
			return message;
		}
		if (vn.state.model.alta===undefined) {
			return error('UNSELECTED_NEW_SUPPLY_POINT');
		}
		if (vn.state.model.alta===false) {
			if (vn.state.model.holderchanges===undefined) {
				return error('OWNER_CHANGED_NOT_CHOSEN');
			}
		}
		if (vn.state.model.alta===true) {
			vn.state.model.farepower &&
				vn.state.model.farepower.validate();
			if (vn.state.model.farepower.error) {
				return error(vn.state.model.farepower.error);
			}
		}
		/*
		if ($scope.form.ownerAcceptsGeneralConditions !== true) {
			return error('UNACCEPTED_GENERAL_CONDITIONS');
		}
		*/
		return vn.state.model.error;
	};
};
Terms.view = function (vn) {
	return [
		m(Chooser, {
			id: 'hassupply',
			question: _('Is the location currently powered?'),
			options: [{
				value: 'yes',
				label: _('Yes, the location is currently powered'),
				description: _(
					'If the location is powered, '+
					'just a change of retailer company to Som Energia is required.'
				),
			},{
				value: 'no',
				label: _('No, currently there is no supply'),
				description: _(
					'When there is no supply, '+
					'even if it has been supplied in the past, '+
					'a new distribution contract is required.'
				),
			}],
			value:
				vn.state.model.alta===true?'no':
				vn.state.model.alta===false?'yes':
				undefined,
			onvaluechanged: function(hassupply) {
				vn.state.model.alta = {
					'yes': false,
					'no': true,
				}[hassupply];
				vn.state.model.holderchanges = undefined;
				vn.state.model.bysurrogation = undefined;
				vn.state.model.validate()
			},
		}),
		vn.state.model.alta!==false?'':
		m(Chooser, {
			id: 'holderchanges',
			question: _('Is the former contract holder to be changed?'),
			options: [{
				value: 'no',
				label: _('No'),
				description: _(
					'It is still the same holder'
				),
			},{
				value: 'yes',
				label: _('Yes'),
				description: _(
					'The new holder is a different one'
				),
			}],
			value:
				vn.state.model.holderchanges===false?'no':
				vn.state.model.holderchanges===true?'yes':
				undefined,
			onvaluechanged: function(holderchanges) {
				vn.state.model.holderchanges = {
					'yes': true,
					'no': false,
				}[holderchanges];
				vn.state.model.bysurrogation = undefined;
				vn.state.model.validate()
			},
		}),
		vn.state.model.holderchanges!==true?'':
		m(Chooser, {
			id: 'bysurrogation',
			question: _('Do you want to change the holder by surrogation?'),
			options: [{
				value: 'yes',
				label: _('Yes, by surrogation'),
				description: _(
					'Surrogation is simpler and cheaper '+
					'but you assume any pending debts '+
					'of the former holder.'
				),
			},{
				value: 'no',
				label: _('No, I do not surrogate'),
				description: _(
					'If you don\'t surrogate, '+
					'you have to pay a deposit '+
					'the distribution company.'
				),
			}],
			value:
				vn.state.model.bysurrogation===false?'no':
				vn.state.model.bysurrogation===true?'yes':
				undefined,
			onvaluechanged: function(bysurrogation) {
				vn.state.model.bysurrogation = {
					'yes': true,
					'no': false,
				}[bysurrogation];
				vn.state.model.validate()
			},
		}),
		m(Layout, m(Row, vn.state.model.alta===true?{}:{style:{display: 'none'}}, [
			m(Cell, {span:12}, _(
				'You need to choose the fare and power for the installation'
			)),
			m(Cell, {span:12},
				m(FarePower, {
					model: vn.state.model.farepower,
					onvaluechanged: function (state) {
						vn.state.model.validate();
						vn.attrs.onvaluechanged &&
							vn.attrs.onvaluechanged();
					}
				})
			),
		]))
	];
};


Terms.Example = {};
Terms.Example.model = {};
Terms.Example.view = function(vn) {
	return m(Layout, [
		m(Row, m(Cell, {span:12}, m('h2', 'Terms'))),
		m(Terms, {
			model: Terms.Example.model,
			onvaluechanged: function(newvalue) {
			},
		}),
		m(Row, m(Cell, {span:12}, m('pre',
			JSON.stringify(Terms.Example.model,null,2)
		))),
	]);
};

module.exports = Terms;


// vim: noet ts=4 sw=4
