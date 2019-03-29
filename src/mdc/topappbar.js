'use strict';
/** @module */

var m = require('mithril');
var MDCTopAppBar = require('@material/top-app-bar').MDCTopAppBar;
require('@material/top-app-bar/dist/mdc.top-app-bar.css');

/**
@namespace TopAppBar
@description A Material Design TopAppBar wrapped as Mithril component.

@property {undefined|string} title - TopAppBar title text
@property {bool} fixed - Used to style the top app bar as a fixed top app bar
*/

var TopAppBar = {};

TopAppBar.oncreate = function(vn) {
	vn.state.widget = new MDCTopAppBar(vn.dom);
};

TopAppBar.onremove = function(vn) {
	vn.state.widget.destroy();
};

TopAppBar.view = function(vn) {

	return m(".mdc-top-app-bar "+(vn.attrs.fixed?'.mdc-top-app-bar--fixed':''), 
		m(".mdc-top-app-bar__row", 
			m("section.mdc-top-app-bar__section.mdc-top-app-bar__section--align-start",
				[
					m("span.mdc-top-app-bar__title", 
						(vn.attrs.title !== undefined ? m.trust(vn.attrs.title):'') 
					)
				]
			)
		)
	);
};

TopAppBar.Example = {
	title: 'Example TopAppBar',
	fixed: false
};

TopAppBar.Example.view = function(vn) {
	return m(TopAppBar, {
			title: TopAppBar.Example.title,
			fixed: TopAppBar.Example.fixed
		});	
};

module.exports=TopAppBar;

// vim: noet ts=4 sw=4
