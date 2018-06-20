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

var WizardTab = {
	oncreate: function(vn) {
		var mdctab = vn.dom.querySelector('.mdc-tab');
		//MDCTab.attachTo(mdctab);
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
	oninit: function(vn) {
		this.pages = vn.children;
		this.pages.map(function(page) {
			vn.state.currentPage = vn.state.currentPage || page.attrs.id;
		});
	},
	onupdate: function(vn) {
		var mdctabbar = vn.dom.querySelector('.mdc-tab-bar');
		//this.mdcinstance = MDCTabBar.attachTo(mdctabbar);
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
				var style = active?{}:{display: 'none'};
				var errors = page.attrs.validator && page.attrs.validator();
				return m('', {style: style}, [
					m(Layout, [
						page.children,
						m(Row, {align: 'right'}, [
							m(Cell,{span:8}, m('.mdc-.red', errors)),
							m(Cell,{span:2},
								m('button.mdc-button.mdc-button--outlined', {
									tabindex: 0,
									disabled: page.attrs.prev===undefined,
									onclick: function() {
										var model = page.attrs.model;
										self.prev();
									},
									style: {width:'100%'},
								},  _("Previous")),
							),
							m(Cell,{span: 2},
								m('button.mdc-button.mdc-button--raised', {
									tabindex: 0,
									disabled: errors !== undefined,
									onclick: function() {
										var model = page.attrs.model;
										self.next();
										},
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


var Persona = {
	field: undefined,
	name: undefined,
	nif: undefined,
	nifValidation: {},
};

var PersonalDataEditor = {
	view: function(vn) {
		return [
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
						id: 'caixa3',
						label: _('Caixa 3'),
						help: _('I encara una tercera caixa'),
					})
				),
			]),
			m(Row, [
				m(Cell, {span:7},
					m(ValidatedInput, {
						id: 'iban',
						label: _('IBAN (compte bancari)'),
						help: _('I encara una tercera caixa'),
						defaulterror: _('Invalid IBAN'),
						required: true,
						checkurl: '/check/iban/',
						value: Persona.iban,
						onChange: function(value) {
							Persona.iban = value;
						},
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
		];
	},
};

var Form = {
	view: function() {
		return m('.form.mdc-typography', [
			m(Wizard, {
			}, [
				m('', {
					id: 'holder',
					title: _('Holder'),
					next: 'supply',
				}, [
					m(PersonalDataEditor),
				]),
				m('', {
					id: 'supply',
					title: _('Supply point'),
					prev: 'holder',
					next: 'confirm',
					validator: function() {
						if (Persona.field=='caca')
							return _('Watch your tonge');
					},

				}, m(Row, [
					m(Cell, {span:6}, m(ValidatedInput, {
						id: 'afield',
						label: _('Field label'),
						help: _('Field Help'),
						icon: '.fa-spinner.fa-spin',
						value: Persona.field,
						onChange: function(value) {
							Persona.field = value;
						},
					})),
					m(Cell, {span:6}, m(ValidatedInput, {
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
					})),
				])),
				m('', {
					id: 'confirm',
					title: _('Confirmation'),
					prev: 'supply',
				}, m(Row, [
					m(Cell, {span:8}, m(ValidatedInput, {
						id: 'name',
						label: _('Name'),
						required: true,
						help: _('Ayuda'),
						value: Persona.name,
						onChange: function(value) {
							Persona.name = value;
						},
					})),
				])),
			]),
		]);
	},
};


window.onload = function() {
	var element = document.getElementById("mithril-target");
	m.mount(element, Form);
};
// vim: noet ts=4 sw=4
