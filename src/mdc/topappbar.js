'use strict';
/** @module */

var m = require('mithril');
var MDCTopAppBar = require('@material/top-app-bar').MDCTopAppBar;
require('@material/icon-button/dist/mdc.icon-button.css');
require('@material/top-app-bar/dist/mdc.top-app-bar.css');

const Checkbox = require('./checkbox');

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

TopAppBar.onupdate = function(vn) {
	vn.state.widget.destroy();
	vn.state.widget = new MDCTopAppBar(vn.dom);
};

TopAppBar.onremove = function(vn) {
	vn.state.widget.destroy();
};

TopAppBar.view = function(vn) {

	return [
		m("header.mdc-top-app-bar"
			+(vn.attrs.dense?'.mdc-top-app-bar--dense':'')
			+(vn.attrs.prominent?'.mdc-top-app-bar--prominent':'')
			+(vn.attrs.fixed?'.mdc-top-app-bar--fixed':'')
			+(vn.attrs['short']?'.mdc-top-app-bar--short':'')
		,[
			m('.mdc-top-app-bar__row',
				m('section'
					+'.mdc-top-app-bar__section'
					+'.mdc-top-app-bar__section--align-start',
					[
						m('button'
							+'.mdc-top-app-bar__navigation-icon'
							+'.mdc-icon-button'
							+'.material-icons'
							, {
								'aria-label': "Open navigation menu",
							},
							"menu"
							//m('i.material-icons', "menu")
						),
						m("span.mdc-top-app-bar__title",
							(vn.attrs.title !== undefined ? vn.attrs.title:'')
						)
					]
				),
				m('.section'
					+'.mdc-top-app-bar__section'
					+'.mdc-top-app-bar__section--align-end'
					+'[role="toolbar]', 
					vn.attrs.actions.map(action=>{
						return m('button'
							+'.material-icons'
							+'.mdc-top-app-bar__action-item'
							+'.mdc-icon-button'
							, {
								'ariel-label': action.label,
							}, action.icon
						);
					}),
				)
			)
		]),
		(vn.attrs.fixed||true?
			m('.mdc-top-app-bar--'
				+(vn.attrs.dense?'dense-':'')
				+(vn.attrs.prominent?'prominent-':'')
				+'fixed-adjust', vn.children
			):vn.children)
	];
};

TopAppBar.Example = {
	title: 'Example TopAppBar',
	fixed: true,
	dense: false,
	prominent: false,
	'short': false,
};

TopAppBar.Example.view = function(vn) {
	var Layout = require('./layout');
	return m(TopAppBar, {
			title: TopAppBar.Example.title,
			fixed: TopAppBar.Example.fixed,
			dense: TopAppBar.Example.dense,
			prominent: TopAppBar.Example.prominent,
			'short': TopAppBar.Example['short'],
			actions: [
				{
					label: "Valora",
					icon: 'star',
				},
				{
					label: "Favorites",
					icon: 'favorites',
				},
				{
					label: "Search",
					icon: 'search',
				},
				{
					label: "Options",
					icon: 'more_vert',
				},
			]
		}, [
		m(Layout, [
			m(Layout.Row,[
				m(Layout.Cell,{span:3}, [
					m(Checkbox, {
						id: 'fixed',
						label: 'Fixed',
						checked: TopAppBar.Example.fixed,
						onchange: ev => {
							TopAppBar.Example.fixed = ev.target.checked;
						},
					}),
				]),
			]),
			m(Layout.Row,[
				m(Layout.Cell,{span:3}, [
					m(Checkbox, {
						id: 'short',
						label: 'Short',
						checked: TopAppBar.Example['short'],
						onchange: ev => {
							TopAppBar.Example['short'] = ev.target.checked;
						},
					}),
				]),
			]),
			m(Layout.Row,[
				m(Layout.Cell,{span:3}, [
					m(Checkbox, {
						id: 'dense',
						label: 'Dense',
						checked: TopAppBar.Example.dense,
						onchange: ev => {
							TopAppBar.Example.dense = ev.target.checked;
						},
					}),
				]),
			]),
			m(Layout.Row,[
				m(Layout.Cell,{span:3}, [
					m(Checkbox, {
						id: 'prominent',
						label: 'Prominent',
						checked: TopAppBar.Example.prominent,
						onchange: ev => {
							TopAppBar.Example.prominent = ev.target.checked;
						},
					}),
				]),
			]),
		])
	]);
};

module.exports=TopAppBar;

// vim: noet ts=4 sw=4
