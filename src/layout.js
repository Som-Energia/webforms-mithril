'use strict';
var m = require('mithril');
require('@material/layout-grid/dist/mdc.layout-grid.css');

function pop(o,k) { var r=o[k]; if (r!==undefined) { delete o[k];} return r; }
var Layout = {
	view: function(vnode) {
		return m('.mdc-layout-grid', vnode.attrs, vnode.children);
	},
};
var Row = {
	view: function(vnode) {
		return m('.mdc-layout-grid__inner', vnode.attrs, vnode.children);
	},
};
var Cell = {
	view: function(vnode) {
		var attrs = Object.assign({},vnode.attrs);
		var span = pop(attrs, 'span');
		var order = pop(attrs, 'order'); // 1 to 12
		var align = pop(attrs, 'align'); // left, right, undefined (center)
		return m(
			(span?'.mdc-layout-grid__cell--span-'+span:'')+
			(order?'.mdc-layout-grid__cell--order-'+order:'')+
			(align?'.mdc-layout-grid__cell--align-'+align:'')+
			'.mdc-layout-grid__cell'+
			'', attrs, vnode.children);
	},
};
Layout.Row = Row;
Layout.Cell = Cell;

module.exports = Layout

// vim: noet ts=4 sw=4
