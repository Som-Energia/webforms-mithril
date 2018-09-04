'use strict';
var m = require('mithril');
var Mousetrap = require('mousetrap');
require('mousetrap-global-bind');

const Inspector = {};

Inspector.oncreate = function(vn) {
	Mousetrap.bindGlobal(vn.attrs.shortcut, function() {
		var inspector = vn.dom;
		inspector.classList.toggle('shown');
		return false;
	});
};

Inspector.view = function(vn) {
	return m('.inspector',
		m('pre', JSON.stringify(vn.attrs.model, null, 2)));
};

module.exports = Inspector;


