'use strict';
var m = require('mithril');
require('@material/button/dist/mdc.button.css');


/**
@namespace mdc
@class Button
Mithril component wrapping a MDC Button component.

Attributes:

- raised: shows the button in raised style
- unelevated: shows the button in unelevated style
- outlined: shows the button in outlined style
- dense: shows the inner letters in dense mode
- faicon: name for a leading icon of the font-awesome collection
- Any other attributes are set to the button 

Children:

- The content (text) of the button.

*/
var Button = {
	view: function(vn) {
		var attrs = vn.attrs;	
		return  m('button'+
			'.mdc-button'+
			(vn.attrs.raised ? '.mdc-button--raised' : '')+
			(vn.attrs.unelevated ? '.mdc-button--unelevated' : '')+
			(vn.attrs.outlined ? '.mdc-button--outlined' : '')+
			(vn.attrs.dense ? '.mdc-button--dense' : '')+
			'', attrs, [
			(vn.attrs.faicon ? m('i.mdc-button__icon.fa.fa-'+vn.attrs.faicon):''),
			vn.children,
		]);
	},
};


Button.Example = {
	view: function(vn) {
		var Layout = require('./layout');
		return m(Layout,
			m(Layout.Row, m(Layout.Cell, m('h2', 'Buttons'))),
			m(Layout.Row, {align: 'center'}, [
			m(Layout.Cell, {span:3}, m(Button, 'Standard')),
			m(Layout.Cell, {span:3}, m(Button, {raised:true}, 'Raised')),
			m(Layout.Cell, {span:3}, m(Button, {unelevated:true}, 'Unelevated')),
			m(Layout.Cell, {span:3}, m(Button, {outlined:true}, 'Outlined')),
			m(Layout.Cell, {span:3}, m(Button, {dense:true}, 'Standard dense')),
			m(Layout.Cell, {span:3}, m(Button, {dense:true, raised:true}, 'Raised dense')),
			m(Layout.Cell, {span:3}, m(Button, {dense:true, unelevated:true}, 'Unelevated dense')),
			m(Layout.Cell, {span:3}, m(Button, {dense:true, outlined:true}, 'Outlined dense')),
			m(Layout.Cell, {span:3}, m(Button, {raised:true, faicon: 'trash' }, 'Icon')),
			m(Layout.Cell, {span:3}, m(Button, {raised:true, faicon: 'spinner.fa-spin' }, 'Spinning')),
			m(Layout.Cell, {span:3}, m(Button, {style: 'color: red'},'Colored')),
			m(Layout.Cell, {span:3}, m(Button, {disabled: true},'Disabled')),
			m(Layout.Cell, {span:3}, m(Button, {onclick: function(ev) {console.log("Hola mundo");}},'Consoleme')),
		]));
	}
};

module.exports=Button;

// vim: noet ts=4 sw=4
