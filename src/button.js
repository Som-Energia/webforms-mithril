'use strict';
var m = require('mithril');
require('@material/button/dist/mdc.button.css');


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
		return m('',[
			m(Button, 'Standard'),
			m(Button, {raised:true}, 'Raised'),
			m(Button, {unelevated:true}, 'Unelevated'),
			m(Button, {outlined:true}, 'Outlined'),
			m(Button, {dense:true}, 'Standard dense'),
			m(Button, {dense:true, raised:true}, 'Raised dense'),
			m(Button, {dense:true, unelevated:true}, 'Unelevated dense'),
			m(Button, {dense:true, outlined:true}, 'Outlined dense'),
			m(Button, {raised:true, faicon: 'exclamation' }, 'Icon'),
			m(Button, {raised:true, faicon: 'spinner.fa-spin' }, 'Icon'),
			m(Button, {onclick: function(ev) {console.log("Hola mundo");}},'Consoleme'),
			m(Button, {style: 'color: red'},'Consoleme'),
			m(Button, {disabled: true},'Consoleme'),
		]);
	}
};

module.exports=Button;

// vim: noet ts=4 sw=4
