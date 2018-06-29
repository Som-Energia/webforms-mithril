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
Chooser.init = function (vn) {
	vn.state.value = vn.attrs.value;
};
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
					(vn.state.value === option.id?'.chooser__option--selected':'')+
					'',[
					m(Checkbox,
					{
						id: option.id,
						label: option.label,
						checked: vn.state.value===option.id,
						onchange: function(ev) {
							var newvalue = ev.target.checked;
							console.log(newvalue, option.id);
							if (ev.target.checked===true) {
								vn.state.value = option.id;
							}
							else if (vn.state.value === option.id) {
								vn.state.value = undefined;
							}
							vn.attrs.onvaluechanged &&
								vn.attrs.onvaluechanged(vn.state.value);
						},
					}),
					m('.choser__option__description', m('label', {
						'for': option.id,
					},
						option.description
					)),
				]),
			]);
		})),
	]);
};


Chooser.Example = {};
Chooser.Example.view = function(vn) {
	return m(Layout, [
		m(Row, m(Cell, {span:12}, m('h2', 'Chooser'))),
		m(Chooser, {
			question: _('Do you want to take either the red or the blue pill?'),
			options: [{
				id: 'redpill',
				label: _('Red pill'),
				description: _(
					'The brutal and akward freedom of thruth. '+
					'Take it if you want to know the real and desperate thruth.'
				),
			},{
				id: 'bluepill',
				label: _('Blue pill'),
				description: _(
					'The conforting ignorance of dellusion.'+
					'Take it if you want to go back to your reality.'
				),
			}],
			onvaluechanged: function(newvalue) {
				Chooser.Example.value = newvalue;
			},
		}),
		m(Row, m(Cell, {span:12}, m('', _('You chose ')+Chooser.Example.value))),
	]);
};

module.exports = Chooser;


// vim: noet ts=4 sw=4
