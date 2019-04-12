'use strict';
var m = require('mithril');
var MDCSnackbar = require('@material/snackbar').MDCSnackbar;
require('@material/snackbar/dist/mdc.snackbar.css');
require('@material/icon-button/dist/mdc.icon-button.css');

/** @module */

/**
@namespace Snackbar

@description
A Mithril component wrapping a Material Design Floating Action Button.
@property {object} model - An empty object to be filled with the public API methods.
@property {function} model.open() - Opens the snackbar
@property {function} model.close(action) - Closes the dialog with the given action
@property {bool} stacked   Shows the snackbar in stacked style
@property {bool} leading  Shows the snackbar in leading style
@property {string} action  Text for action item
@property {bool} dismiss
@property - Any other attribute is propagated to the button subelement.
  Interesting ones are `onclick`, `disabled`, `style`...
@property {text/vnode} children Any component children are taken as the content of the label

*/

var Snackbar = {
	oncreate: function(vn) {
		vn.state.widget = new MDCSnackbar(vn.dom);
		//vn.state.widget.setTimeoutMs(10000);
	},
	oninit: function(vn) {
		vn.state.model = vn.attrs.model || {};
		vn.state.model.open = function() {
			if(!vn.state.widget.isOpen)
				vn.state.widget.open();
		};
		vn.state.model.close = function(action) {
			if(vn.state.widget.isOpen)
				vn.state.widget.close(action);
		};
	},		
	onremove: function(vn) {
		vn.state.widget.destroy();
	},
	view: function(vn) {
		var attrs = vn.attrs;	
		return  m('.mdc-snackbar'+
			(vn.attrs.stacked ? '.mdc-snackbar--stacked' : '')+
			(vn.attrs.leading ? '.mdc-snackbar--leading' : '')+
			'', attrs, [
				m('.mdc-snackbar__surface', [	
					m('.mdc-snackbar__label', {'role':'status', 'aria-live':'polite'}, vn.children),
					( vn.attrs.action || vn.attrs.dismiss ? m('.mdc-snackbar__actions', [
						(vn.attrs.action ? m(vn.attrs.action) : ''),
						(vn.attrs.dismiss ? m('button.mdc-icon-button.mdc-snackbar__dismiss.material-icons',{'title':'Dismiss'}, 'close') : '')
					]):''),
				]),	
			]);
	},
};

module.exports=Snackbar;

// vim: noet ts=4 sw=4
