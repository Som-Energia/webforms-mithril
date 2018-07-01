'use strict';
var m = require('mithril');
var _ = require('./translate');
var css = require('./style.styl');
var Wizard = require('./wizard');
var Layout = require('./mdc/layout');
var Row = Layout.Row;
var Cell = Layout.Cell;
var Checkbox = require('./mdc/checkbox');
require('./chooser.styl');

const Chooser = {};
Chooser.view = function (vn) {
	return m(Layout, {className: 'chooser'}, [
		m(Row, m(Cell, {
			className: 'chooser__question',
			span: 12,
			}, 
			vn.attrs.question,
			m('i.fa.fa-asterisk.red')
		)),
		m(Row, vn.attrs.options.map(function(option) { 
			return m(Cell, {
				phonespan:2,
				spantablet:4,
				spandesktop:6,
				className: 'chooser__options',
			}, [
				m('.chooser__option'+
					(vn.attrs.value === option.value?'.chooser__option--selected':'')+
					'',[
					m(Checkbox,
					{
						id: optionid,
						label: option.label,
						checked: vn.attrs.value===option.value,
						onchange: function(ev) {
							var newvalue = ev.target.checked;
							if (ev.target.checked===true) {
								vn.attrs.value = option.value;
							}
							else if (vn.attrs.value === option.value) {
								vn.attrs.value = undefined;
							}
							vn.attrs.onvaluechanged &&
								vn.attrs.onvaluechanged(vn.attrs.value);
						},
					}),
					m('.choser__option__description', m('label', {
						'for': optionid,
					},
						option.description
					)),
				]),
			]);
		})),
	]);
};


Chooser.Example = {};
Chooser.Example.value2 = 'bluepill'; // default value provided
Chooser.Example.view = function(vn) {
	return m(Layout, [
		m(Row, m(Cell, {span:12}, m('h2', 'Chooser'))),
		m(Chooser, {
			question: _('Do you want to take either the red or the blue pill?'),
			options: [{
				value: 'redpill',
				label: _('Red pill'),
				description: _(
					'The brutal and akward freedom of thruth. '+
					'Take it if you want to know the real and desperate thruth.'
				),
			},{
				value: 'bluepill',
				label: _('Blue pill'),
				description: _(
					'The conforting ignorance of dellusion.'+
					'Take it if you want to go back to your reality.'
				),
			}],
			value: Chooser.Example.value,
			onvaluechanged: function(newvalue) {
				Chooser.Example.value = newvalue;
			},
		}),
		m(Row, m(Cell, {span:12}, m('', _('You chose ')+Chooser.Example.value))),
		m(Chooser, {
			id: 'chooser_by_default',
			question: _('A chooser with default value and required'),
			required: true,
			options: [{
				value: 'redpill',
				label: _('Red pill'),
				description: _(
					'The brutal and akward freedom of thruth.'
				),
			},{
				value: 'bluepill',
				label: _('Blue pill'),
				description: _(
					'The conforting ignorance of dellusion.'
				),
			}],
			value: Chooser.Example.value2,
			onvaluechanged: function(newvalue) {
				Chooser.Example.value2 = newvalue;
			},
		}),
		m(Row, m(Cell, {span:12}, m('', _('You chose ')+Chooser.Example.value2))),
	]);
};

module.exports = Chooser;


// vim: noet ts=4 sw=4
