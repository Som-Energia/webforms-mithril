'use strict';
var m = require('mithril');
var _ = require('./translate');
var Layout = require('./mdc/layout');
var Row = Layout.Row;
var Cell = Layout.Cell;
require('@material/tabs/dist/mdc.tabs.css');
var Button = require('./mdc/button');
var MDCTab = require('@material/tabs').MDCTab;
var MDCTabBar = require('@material/tabs').MDCTabBar;



require('@material/typography/dist/mdc.typography.css').default;

var WizardTab = {
	view: function(vn) {
		var active = vn.attrs.active;
		return m('a.mdc-tab[role=tab]'+
			(active?'.mdc-tab--active':'')+
			(active?'.mdc-theme--primary':'.mdc-theme--secondary')+
		'', {
			href: '#',
			tabindex: -1, // Excluded from tab navitation
			disabled: true,//vn.attrs.disabled,
		}, [
			vn.children,
			m('span.mdc-tab__indicator'),
		]);
	},
};

var Wizard = {
	oninit: function(vn) {
		this.pages = vn.children;
		this.pages.map(function(page) {
			vn.state.currentPage = vn.state.currentPage || page.attrs.id;
		});
	},
	view: function(vn) {
		var self = this;
		return m('', [
			m('nav.mdc-tab-bar[role=tablist]', self.pages.map(function(page,i) {
				var active = self.currentPage === page.attrs.id;
				var title = page.attrs.title;
				return m(WizardTab, {
					href: '#',
					disabled: true,
					active: active,
					}, (i+1)+' '+title);
			})),
			m('span.mdc-tab-bar__indicator'),
			vn.children.map(function(page) {
				var active = self.currentPage === page.attrs.id;
				var style = active||vn.attrs.showall?{}:{display: 'none'};
				var errors = page.attrs.validator && page.attrs.validator();
				return m('', {style: style}, [
					m(Layout, [
						page.children,
						m(Row, {align: 'right'}, [
							m(Cell,{span:8}, m('.red', errors)),
							m(Cell,{span:2},
								m(Button, {
									outlined: true,
									faicon: 'chevron-left',
									tabindex: 0,
									disabled: page.attrs.prev===undefined,
									onclick: function() { self.prev(); },
									style: {width:'100%'},
								},  _("Previous")),
							),
							m(Cell,{span: 2},
								m(Button, {
									raised:true,
									faicon: 'chevron-right',
									tabindex: 0,
									disabled: errors !== undefined,
									onclick: function() { self.next(); },
									style: {width:'100%'},
									},
									page.attrs.next===undefined?_('Submit'):_("Next")
								)
							),
						]),
					]),
				]);
			}),
		]);
	},
	search: function(pageid) {
		return this.pages.find(function(v) {
			return v.attrs.id===pageid; });
	},
	go: function(page) {
		if (!page) {return;}
		this.currentPage = page;
	},
	prev: function() {
		var currentPage = this.search(this.currentPage);
		this.go(currentPage.attrs.prev)
	},
	next: function() {
		var currentPage = this.search(this.currentPage);
		this.go(currentPage.attrs.next)
	},
};

module.exports=Wizard
// vim: noet ts=4 sw=4
