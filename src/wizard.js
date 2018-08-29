'use strict';
var m = require('mithril');
var _ = require('./translate');


var TabBar = require('./mdc/tabbar');
var Layout = require('./mdc/layout');
var Row = Layout.Row;
var Cell = Layout.Cell;
var Button = require('./mdc/button');
var Pager = require('./pageslider');
var LinearProgress = require('./mdc/linearprogress');

var Wizard = {
	oninit: function(vn) {
		this.pages = vn.children;
		this.pages.map(function(page) {
			vn.state.currentPage = vn.state.currentPage || page.attrs.id;
		});
	},
	view: function(vn) {
		var self = this;
		var currentIndex = vn.children.findIndex(function(child) {
			return self.currentPage === child.attrs.id;
		});
		return m('', [
			m(LinearProgress, {
				max: vn.children.length-1,
				value: currentIndex,
			}),
			false && m(TabBar, {
				align:'center',
				index: currentIndex,
				tabs: self.pages.map(function(page,i) {
					var active = self.currentPage === page.attrs.id;
					var title = page.attrs.title;
					return {
						disabled: true,
						icon: (i+1),
						text: (i+1)+' '+title,
					};
				}),
			}),
			m(Pager, {
				current: currentIndex,
			}, vn.children.map(function(page) {
				var active = self.currentPage === page.attrs.id;
				var errors = page.attrs.validator && page.attrs.validator();
				return m('.tabpanel[role=tabpanel]'+
						(active?'.active':'')+
						'', {
//						'aria-hidden': (!active && !vn.attrs.showall)?'true':'false',
					}, [
					m(Layout, [
						m(Cell, {span:12}, m('h2', page.attrs.title)),
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
									faicon: page.attrs.next===undefined?'send':'chevron-right',
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
			})),
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

Wizard.Example = {};
Wizard.Example.showall=false;
Wizard.Example.view = function(vn) {
	var FarePower = require('./farepower');
	var ValidatedField = require('./validatedfield');
	return m(Layout, [
		m(Layout.Cell, {span: 12}, m('h2', 'Wizard')),
		m(Layout.Cell, {span: 12}, m(Wizard, {
			showall: Wizard.Example.showall,
		}, [
			m('.page', {
				id: 'holder',
				title: _('Holder'),
				next: 'supply',
			}, [
				m('h2', 'Page 1'),
			]),

			m('.page', {
				id: 'supply',
				title: _('Supply point'),
				prev: 'holder',
				next: 'confirm',
				validator: function() {
					if (vn.state.farepower) {
						return vn.state.farepower.error;
					}
				},
			}, [
				m(FarePower, {model: vn.state.farepower})
			]),
			m('.page', {
				id: 'confirm',
				title: _('Confirmation'),
				prev: 'supply',
			}, m(Row, [
				m(Cell, {span:6}, m(ValidatedField, {
					id: 'afield',
					label: _('Field label'),
					help: _('Field Help'),
					icon: '.fa-spinner.fa-spin',
					value: Persona.field,
					onChange: function(value) {
						Persona.field = value;
					},
				})),
				m(Cell, {span:6}, m(ValidatedField, {
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
				m(Cell, {span:8}, m(ValidatedField, {
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
		])),
	]);
};




module.exports=Wizard
// vim: noet ts=4 sw=4
