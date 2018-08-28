'use strict';

/*
# Tab bar

Widget used to navigate within elements of the same hierarchy by means of tabs.


## Attributes:

- align: (center, start, end)
- index: current tab index
- onactivated: change handler ev.detail.index

## Tab

A tab in a tab bar.

### Attributes

- text: (string) text to be shown if any
- icon: (string) material icon name to be shown if any
- active: (bool) is the active tab
- minwidth: (bool) adapts to the content (do not expand)
- stacked: (bool) places the icon above the text instead
- disabled: (bool) non interactive

*/




var m = require('mithril');
require('@material/tab-bar/dist/mdc.tab-bar.css');
require('@material/tab-scroller/dist/mdc.tab-scroller.css');
require('@material/tab-indicator/dist/mdc.tab-indicator.css');
require('@material/tab/dist/mdc.tab.css');
require('material-design-icons/iconfont/material-icons.css');

var MDCTabBar = require('@material/tab-bar').MDCTabBar;


function traceFocus() {
	console.log('focus:', document.activeElement);
};
window.addEventListener('focus', traceFocus, true);

var TabBar = {};
TabBar.oninit = function(vn) {
	vn.state.index = vn.attrs.index === undefined ? 0 : vn.attrs.index;
	vn.state.model = vn.attrs.model || {};
	vn.state.model.activateTab = function(i) {
		vn.state.widget.activateTab(i);
	};
	vn.state.model.scrollIntoView = function(i) {
		vn.state.widget.scrollIntoView(i);
	};
};
TabBar.oncreate = function(vn) {
	vn.state.widget = new MDCTabBar(vn.dom);
	vn.state.widget.listen('MDCTabBar:activated', function(ev) {
		vn.state.index = ev.detail.index;
		vn.attrs.onactivated && vn.attrs.onactivated(ev);
		m.redraw();
	});
	vn.state.index !== undefined && vn.state.model.activateTab(vn.attrs.index);
};
TabBar.view = function(vn) {
	return m('.mdc-tab-bar[role="tablist"]',
		m('.mdc-tab-scroller'
			+(vn.attrs.align?'.mdc-tab-scroller--align-'+vn.attrs.align:'')
			, [
			m('.mdc-tab-scroller__scroll-area',
				m('.mdc-tab-scroller__scroll-content',
					vn.children
				)
			),
		])
	);
};


var Tab = {};
Tab.view = function(vn) {
	return m('button.mdc-tab'+
		(vn.attrs.active? '.mdc-tab--active':'')+
		(vn.attrs.minwidth? '.mdc-tab--min-width':'')+
		(vn.attrs.stacked? '.mdc-tab--stacked':'')+
	'', Object.assign({
		role: 'tab',
		tabindex: vn.attrs.active?0:-1,
		'aria-selected': vn.attrs.active,
	},vn.attrs),[
		m('span.mdc-tab__content', [
			vn.attrs.icon?m('span.mdc-tab__icon.material-icons', vn.attrs.icon):null,
			vn.attrs.text?m('span.mdc-tab__text-label', vn.attrs.text):null,
		]),
		m('span.mdc-tab-indicator'+
			(vn.attrs.active? '.mdc-tab-indicator--active':''),
			m('span.mdc-tab-indicator__content.mdc-tab-indicator__content--underline')
		),
		m('span.mdc-tab__ripple'),
	]);
};

TabBar.Tab = Tab;

TabBar.Example = {};
TabBar.Example.model = {
	active: 1,
	expand: true,
	stacked: false,
	icons: true,
	text: true,
	align: 'center',
	disableunfavorite: false,
	active2: 0,
};
TabBar.Example.view = function(vn) {
	var model = vn.state.model;
	var Checkbox = require('./checkbox');
	var Button = require('./button');
	return [
		m('h1', 'Tab bars'),
		m(TabBar, {
			model: TabBar.Example.model,
			index: model.active,
			onactivated: function(ev) {
				console.log('onactivated', ev.detail.index);
				model.active = ev.detail.index;
			},
			align: model.align,
		}, [
			m(Tab, {
				id: 'tabfavorites',
				text: model.text && 'Favorites',
				icon: model.icons && 'favorite',
				active: model.active==0,
				minwidth: !model.expand,
				stacked: model.stacked,
			}),
			m(Tab, {
				id: 'tabunfavorites',
				text: model.text && 'Unfavorites',
				icon: model.icons && 'thumb_down',
				active: model.active==1,
				minwidth: !model.expand,
				disabled: model.disableunfavorite,
				stacked: model.stacked,
			}),
			m(Tab, {
				id: 'tabowner',
				text: model.text && 'Owner',
				icon: model.icons && 'face',
				active: model.active==2,
				minwidth: !model.expand,
				stacked: model.stacked,
			}),
		]),
		m('', 'Alignment:', [
			m(Button, {onclick: function() { model.align='start'; model.expand=false; }},
				'Align Start'),
			m(Button, {onclick: function() { model.align='center'; model.expand=false; }},
				'Align Center'),
			m(Button, {onclick: function() { model.align='end'; model.expand=false; }},
				'Align End'),
			m(Button, {onclick: function() { model.expand=true; }},
				'Expand'),
		]),
		m('', 'Content:', [
			m(Button, {onclick: function() { model.stacked=false; model.icons=true; model.text=true;}},
				'Text & Icons'),
			m(Button, {onclick: function() { model.stacked=false; model.icons=true; model.text=false;}},
				'Icons Only'),
			m(Button, {onclick: function() { model.stacked=false; model.icons=false; model.text=true;}},
				'Text Only'),
			m(Button, {onclick: function() { model.stacked=true; model.icons=true; model.text=true;}},
				'Stacked'),
		]),
		m('', 'Programmatic jump:', [
			m(Button, {onclick: function() { model.active=0; }},
				'Activate 0'),
			m(Button, {onclick: function() { model.active=1; }},
				'Activate 1'),
			m(Button, {onclick: function() { model.active=2; }},
				'Activate 2'),
		]),
		m(Checkbox, {
			id: 'tabbar-disable',
			label: 'Disable unfavorite',
			checked: model.disableunfavorite,
			onchange: function(ev) {
				model.disableunfavorite = ev.target.checked;
			},
		}),
		m('pre', JSON.stringify(model, null, 2)),
		m(TabBar, {
			index: model.active2,
			onactivated: function(ev) {
				model.active2 = ev.detail.index;
			},
		}, [0,1,2,3,4,5,6,7,8,9,10,11].map(function(v) {
			return m(Tab, {
				id: 'tabscroll'+v,
				active: v==0,
				text: 'Scrolled Tab '+v,
				minwidth: true,
			});
		})),
	];
};



module.exports=TabBar;

// vim: noet ts=4 sw=4
