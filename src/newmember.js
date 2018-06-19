'use strict';
var m = require('mithril');
var _ = require('./translate');
var css = require('./style.styl');
var Layout = require('./layout');
var Row = Layout.Row;
var Cell = Layout.Cell;
var Select = require('./select');
var ValidatedInput = require('./validatedinput');
var StateCityChooser = require('./statecity');
require('@material/button/dist/mdc.button.css');
require('@material/tabs/dist/mdc.tabs.css');
var MDCTab = require('@material/tabs').MDCTab;
var MDCTabBar = require('@material/tabs').MDCTabBar;
require('font-awesome/css/font-awesome.css');

require('@material/typography/dist/mdc.typography.css').default;

var Persona = {
	field: undefined,
	name: undefined,
	nif: undefined,
	nifValidation: {},
};

var PersonalDataEditor = {
	view: function(vn) {
		return m(Layout, [
			m(StateCityChooser),
			m(Row, [
				m(Cell,
					m(ValidatedInput, {
						id: 'caixa1',
						label: _('Caixa 1'),
						help: _('La primera caixa'),
					})
				),
				m(Cell,
					m(ValidatedInput, {
						id: 'caixa2',
						label: _('Caixa 2'),
						help: _('La segona caixa'),
					})
				),
				m(Cell,
					m(ValidatedInput, {
						id: 'vat',
						label: _('NIF'),
					})
				),
			]),
			m(Row, [
				m(Cell, {span:7},
					m(ValidatedInput, {
						id: 'vat',
						label: _('NIF'),
					})
				),
				m(Cell, {span:5},
					m(ValidatedInput, {
						id: 'vat',
						label: _('NIF'),
					})
				),
			]),
			m(Row, [
				m(Cell, {span:12},
					m(Select.Example),
				),
			]),
		]);
	},
};

var WizardModel = {
	currentTab: undefined,
	tabsOrder: [],
	tabs: {},
	registerPage: function(vnode) {
		var id = vnode.attrs.id;
		console.log("Registering", id, this.tabs, this.tabsOrder);
		this.currentTab = this.currentTab || id;
		this.tabs[vnode.attrs.id] = vnode;
		this.tabsOrder.push(vnode.attrs.id);
	},
	pageErrors: function(page) {
		var validator = this.tabs[page].attrs.validator;
		if (validator === undefined) return undefined;
		return validator()
	},
	go: function(page) {
		if (!page) {return;}
		this.currentTab = page;
	},
	prev: function() {
		var currentTab = this.tabs[this.currentTab]
		this.go(currentTab.attrs.prev)
	},
	next: function() {
		var currentTab = this.tabs[this.currentTab]
		this.go(currentTab.attrs.next)
	},
};

var WizardTab = {
	oncreate: function(vn) {
		console.log("Tab creating");
		var mdctab = vn.dom.querySelector('.mdc-tab');
		//MDCTab.attachTo(mdctab);
		console.log("Tab created");
	},
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
	onupdate: function(vn) {
		console.log("TabBar creating");
		var mdctabbar = vn.dom.querySelector('.mdc-tab-bar');
		//this.mdcinstance = MDCTabBar.attachTo(mdctabbar);
		console.log("TabBar created");
	},
	view: function(vn) {
		var model = vn.attrs.model;
		console.log("viewing wizard", model);
		return m('', [
			m('nav.mdc-tab-bar[role=tablist]', model.tabs?[
				model.tabsOrder.map(function (v,i) {
					console.log('tab',v,model.currentTab, v);
					var tab = model.tabs[v];
					var active = model.currentTab === v;
					var title = tab.attrs.title;
					return m(WizardTab, {
						href: '#',
						disabled: true,
						active: active,
						}, (i+1)+' '+title);
				}),
			]:[]),
			vn.children,
			m('span.mdc-tab-bar__indicator'),
		]);
	},
};

var WizardPage = {
	oninit: function(vn) {
		vn.attrs.model.registerPage(vn);
	},
	view: function(vn) {
		var model = vn.attrs.model;
		var style = model.currentTab === vn.attrs.id?{}:
			{display: 'none'};
		console.log(model.currentTab, vn.attrs.id, style);
		var errors = model.pageErrors(vn.attrs.id);
		return m('', {style: style}, [
			vn.children,
			m(Layout, //{align: 'right'},
				m(Row, [
					m(Cell,{span:8}, m('.mdc-.red', errors)),
					m(Cell,{span:2},
						m('button.mdc-button.mdc'+
							'', {
							tabindex: 0,
							disabled: vn.attrs.prev===undefined,
							onclick: function() {
								var model = vn.attrs.model;
								model.prev();
							},
							style: {width:'100%'},
						},  _("Previous")),
					),
					m(Cell,{span: 2},
						m('button.mdc-button.mdc-button--raised', {
							tabindex: 0,
							disabled: errors !== undefined,
							onclick: function() {
								var model = vn.attrs.model;
								model.next();
								},
							style: {width:'100%'},
							},
							vn.attrs.next===undefined?_('Submit'):_("Next")
						)
					),
				]),
			)
		]);
	},
};

var Form = {
	view: function() {
		return m('.form.mdc-typography', [
			m(Wizard, {
				model: WizardModel,
			}, [
				m(WizardPage, {
					id: 'holder',
					title: _('Holder'),
					model: WizardModel,
					next: 'supply',
				}, [
					m(PersonalDataEditor),
				]),
				m(WizardPage, {
					id: 'supply',
					title: _('Supply point'),
					model: WizardModel,
					prev: 'holder',
					next: 'confirm',
				}, [
					m(ValidatedInput, {
						id: 'afield',
						label: _('Field label'),
						help: _('Field Help'),
						icon: '.fa-spinner.fa-spin',
						value: Persona.field,
						onChange: function(value) {
							Persona.field = value;
						},
					}),
					m(ValidatedInput, {
						id: 'nif',
						label: _('NIF/DNI'),
						pattern: /[0-9A-Za-z]+/,
						defaulterror: _('Invalid VAT'),
						checkurl: '/check/vat/',
						help: _('Tax ID'),
						value: Persona.nif,
						onChange: function(value) {
							Persona.nif = value;
						},
					}),
				]),
				m(WizardPage, {
					id: 'confirm',
					title: _('Confirmation'),
					model: WizardModel,
					prev: 'supply',
				}, [
					m(ValidatedInput, {
						id: 'name',
						label: _('Name'),
						required: true,
						help: _('Ayuda'),
						value: Persona.name,
						onChange: function(value) {
							Persona.name = value;
						},
					}),
				]),
			]),
		]);
	},
};


window.onload = function() {
	var element = document.getElementById("mithril-target");
	m.mount(element, Form);
};
// vim: noet ts=4 sw=4
