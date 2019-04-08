'use strict';
var m = require('mithril');
require('@material/fab/dist/mdc.fab.css');

/** @module */

/**
@namespace Fab

@description
A Mithril component wrapping a Material Design Floating Action Button.

@property {bool} mini   Shows the button in mini style
@property {bool} extended  Shows the button in extended
@property {string} icon  Name for a leading icon of the Material Design collection
@property {string} trailingicon  Name for a trailing icon of the Material Design collection
@property - Any other attribute is propagated to the button subelement.
  Interesting ones are `onclick`, `disabled`, `style`...
@property {text/vnode} children Any component children are taken as the content of the button

*/
var Fab = {
	view: function(vn) {
		var attrs = vn.attrs;	
		return  m('button'+
			'.mdc-fab'+
			(vn.attrs.mini ? '.mdc-fab--mini' : '')+
			(vn.attrs.extended ? '.mdc-fab--extended' : '')+
			(vn.attrs.disabled ? '.mdc-fab--exited' : '')+
			'', attrs, [
			(vn.attrs.icon ? m('.material-icons.mdc-fab__icon', {'aria-hidden':'true'}, vn.attrs.icon):''),
			(vn.attrs.faicon ? m('i.mdc-button__icon.fa.fa-'+vn.attrs.faicon, {'aria-hidden':'true'}):''),
			m('.mdc-fab__label', vn.children),
			(vn.attrs.trailingicon ? m('.material-icons.mdc-fab__icon', {'aria-hidden':'true'}, vn.attrs.trailingicon):''),
		]);
	},
};

module.exports=Fab;

// vim: noet ts=4 sw=4
