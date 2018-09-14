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


/**
# Wizard

Controls the progress within a serie of steps.

- Each children is a step and the default flow is the children order.
- You can alter this order by setting attributes on the steps.
- You can perform validations on each page
- You can perform exit actions on each page

## Attributes

- `showall`: (bool) show all pages, for debug purposes

## Children

Children are elements representing the pages with the following attributes:

- `id`: (string) the page id, it is important to set it
- `title`: (string) the title to be displayed for the step
- `nexticon`: (string) Font awesome icon name for the next button. Default 'chevron-right'
- `nextlabel`: (string) Lavel for the next button. Default: 'Next'
- `prev`: if defined false, it cannot go back. 
- `next`: (undefined/bool/string/function)
	- `undefined` or `true`: just go to the next in order
	- `false`: do not jump at all
	- `string`: jump to the page with such id
	- `promise`: freezes the buttons and jump when the promise resolves
	- `function`: execute the function that returns the page (any of the other)
- `skipif`: (function) jumping to this page by order, just jumps to the next in order
- `validator`: (function) Returns either false or a reason why you cannot advance.
	If an error message is returned it will be displayed and the 'Next' button will be disabled.
	If it returns undefined, the 'Next' button will be enabled.
	Default: `function () {}`
*/

var Wizard = {
	onupdate: function(vn) {
		this.pages = vn.children;
	},
	oninit: function(vn) {
		var self = this;
		self.model = vn.attrs.model || {};
		// public api
		self.model.goNext = function(value) {
			self.goNext(value);
		};
		self.model.prev = function(value) {
			self.prev(value);
		};
		self.model.current = function() {
			return vn.state.currentPage;
		};

		this.pages = vn.children;
		this.pages.map(function(page) {
			vn.state.currentPage = vn.state.currentPage || page.attrs.id;
		});
		this.intransition = false;
		this.history = [];
	},
	view: function(vn) {
		var self = this;
		var currentIndex = self.pageIndex(self.currentPage);
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
				showall: vn.attrs.showall,
			}, vn.children.map(function(page) {
				var active = self.currentPage === page.attrs.id;
				var errors = page.attrs.validator && page.attrs.validator();
				var showNext = page.attrs.next !== false;
				var showPrev = page.attrs.prev !== false;
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
								showPrev && m(Button, {
									outlined: true,
									faicon: 'chevron-left',
									tabindex: 0,
									disabled: !self.history.length || self.intransition,
									onclick: function() { self.prev(); },
									style: {width:'100%'},
								},  _("Previous")),
							),
							m(Cell,{span: 2},
								showNext && m(Button, {
									raised:true,
									faicon: self.intransition?'spinner.fa-spin': (page.attrs.nexticon||'chevron-right'),
									tabindex: 0,
									disabled: errors !== undefined || self.intransition,
									onclick: function() { self.next(); },
									style: {width:'100%'},
									},
									page.attrs.nextlabel||_("Next")
								)
							),
						]),
					]),
				]);
			})),
		]);
	},
	page: function(pageid) {
		return this.pages.find(function(child) {
			return child.attrs.id===pageid;
		});
	},
	pageIndex: function(pageid) {
		var index = this.pages.findIndex(function(child) {
			return child.attrs.id === pageid;
		});
		if (index === -1) index = 0;
		return index;
	},
	go: function(page) {
		if (!page) {return;}
		this.currentPage = page;
	},
	prev: function() {
		this.go(this.history.pop());
	},
	goNext: function(page) {
		if (page === true) {
			page = this.defaultNext();
		}
		if (!page) { return; }
		this.history.push(this.currentPage);
		this.go(page);
	},
	/// Finds the next by order
	defaultNext: function() {
		var self = this;
		var currentIndex = self.pageIndex(self.currentPage);
		var next = self.pages.slice(currentIndex+1).find(function(page) {
			if (page.attrs.skipif !== undefined) {
				return ! page.attrs.skipif();
			}
			return true;
		})
		if (next===undefined) return false; // we were at the last one, do not move
		return next.attrs.id;
	},
	next: function() {
		function isPromise(thing) {
			return thing.then !== undefined;
		}
		var self = this;
		var currentPage = self.page(self.currentPage);
		var nextAttribute = currentPage.attrs.next;
		// default value
		console.log("Next: ", self.currentPage, nextAttribute);
		if (nextAttribute===undefined) {
			nextAttribute=true;
		}
		if (typeof nextAttribute !== 'function') {
			return self.goNext(nextAttribute);
		}
		var maybePromise = nextAttribute();
		if (!isPromise(maybePromise)) {
			return self.goNext(maybePromise);
		}
		self.intransition=true;
		maybePromise.then(function (nextPage) {
			self.intransition=false;
			self.goNext(nextPage);
			m.redraw();
		}).catch(function(reason) {
			self.intransition=false;
			m.redraw();
		});
	},
};

/*
TODO: TEST
- onstart, first page is 0
- next=true, goes to next in order
- next=undefined, goes to next in order
- next=false stays
- next=true and next skipif evaluates to true, skips
- next=true and next skipif evaluates to false, do not skip
- next=explicitPage
- next=notExistingPage
- next=function evaluates the function
- next=promise evaluates the promise async
- on start, skipif is considered to jump 0 or later
- next=true, but none left, stays
*/

Wizard.Example = {};
Wizard.Example.showall=false;
Wizard.Example.clearerror=false;
Wizard.Example.skippage3=false;
Wizard.Example.skippage4=false;
Wizard.Example.skippage5=false;
Wizard.Example.skippage6=false;
Wizard.Example.simulateSubmitError=false;
Wizard.Example.recoverableError=false;
Wizard.Example.farepower={};
Wizard.Example.wizardModel={};
Wizard.Example.view = function(vn) {
	var FarePower = require('./farepower');
	var ValidatedField = require('./validatedfield');
	var Checkbox = require('./mdc/checkbox');
	return m(Layout.Row, [
		m(Layout.Cell, {span: 12}, m('h2', 'Wizard')),
		m(Layout.Cell, {span: 3}, m(Checkbox, {
			id: 'showall',
			label: 'Debug showall mode',
			checked: vn.state.showall,
			onchange: function(ev) {vn.state.showall = ev.target.checked; },
		})),
		m(Layout.Cell, {span: 3}, 
			m('button',{
				onclick: function() {
					console.log(vn.state.wizardModel);
					vn.state.wizardModel.goNext('secret');
				},
			},_('Jump to the secret page'))
		),
		m(Layout.Cell, {span: 12}, m(Wizard, {
			showall: vn.state.showall,
			model: vn.state.wizardModel,
		}, [
			m('', {
				id: 'page1',
				title: _('Page 1: Default page'),
				validator: function() {
					return vn.state.clearerror?undefined:
						_('You must mark the check');
				},
			}, [
				m('',_('No next, just by order')),
				m(Checkbox, {
					id: 'wizardexample_errorpage1',
					label: _('Mark this to be able to go on'),
					checked: vn.state.clearerror,
					onchange: function(ev) {vn.state.clearerror=ev.target.checked;},
				}),
			]),

			m('', {
				id: 'page2',
				title: _('Page 2: Default but next have skipif'),
			}, [
				m('', _('By default, next go to page 3')),
				m(Checkbox, {
					id: 'wizardexample_skippage3',
					label: _('Skip page 3'),
					checked: vn.state.skippage3,
					onchange: function(ev) {vn.state.skippage3=ev.target.checked;},
				}),
			]),
			m('', {
				id: 'page3',
				title: _('Page 3: Explicit next'),
				skipif: function() {return vn.state.skippage3;},
				next: vn.state.skippage4?'page5':true,
			}, [
				m('', _('next is set to a conditional expression, computed on render')),
				m('', _('If you check this, the result is `\'page5\'`, if not, `true` meaning normal flow')),
				m('', _('Current value: %{value}', {value: vn.state.skippage4?'page5':true})),
				m(Checkbox, {
					id: 'wizardexample_skippage4',
					label: _('Skip page 4'),
					checked: vn.state.skippage4,
					onchange: function(ev) {vn.state.skippage4=ev.target.checked;},
				}),
			]),

			m('', {
				id: 'page4',
				title: _('Page 4: Functional next'),
				next: function() { return vn.state.skippage5?'page6':true; },
			}, [
				m('', _('next is a function that is only evaluated when you click it')),
				m(Checkbox, {
					id: 'wizardexample_skippage5',
					label: _('Skip page 5'),
					checked: vn.state.skippage5,
					onchange: function(ev) {vn.state.skippage5=ev.target.checked;},
				}),
			]),

			m('', {
				id: 'page5',
				title: _('Page 5: Asynchronous jump'),
				next: function() {
					return new Promise(function(accept, reject) {
						setTimeout(function() {
							accept(vn.state.skippage6?'confirm':true);
						}, 2000);
					});
				},
			}, [
				m('', _('')),
				m(Checkbox, {
					id: 'wizardexample_skippage6',
					label: _('Skip page 6'),
					checked: vn.state.skippage6,
					onchange: function(ev) {vn.state.skippage6=ev.target.checked;},
				}),
			]),
			m('', {
				id: 'page6',
				title: _('Page 6: Complex validation'),
				validator: function() {
					if (vn.state.farepower) {
						return vn.state.farepower.error;
					}
				},
			}, [
				m(FarePower, {model: vn.state.farepower})
			]),
			m('', {
				id: 'confirm',
				title: _('Confirmation'),
				nexticon: 'send',
				nextlabel: _('Submit'),
				next: function() {
					// This should be the post
					return new Promise(function(accept, reject) {
						setTimeout(function() {
							accept(vn.state.simulateSubmitError?'error':'success');
						}, 1000);
					});
				},
			}, [
				m(Checkbox, {
					id: 'wizardexample_submiterror',
					label: _('Simulate a submit error'),
					checked: vn.state.simulateSubmitError,
					onchange: function(ev) {vn.state.simulateSubmitError=ev.target.checked;},
				}),
				m(Checkbox, {
					id: 'wizardexample_recoverableError',
					label: _('The error is recoverable'),
					checked: vn.state.recoverableError,
					onchange: function(ev) {vn.state.recoverableError=ev.target.checked;},
				}),
			]),
			m('', {
				id: 'error',
				title: _('Error'),
				prev: vn.state.recoverableError,
				next: false,
			}, [
				m('',_('Error while sending wizard info')),
				m('',_('Next button not available')),
			]),
			m('', {
				id: 'success',
				title: _('Succes!!'),
				prev: false,
				next: false,
			}, [
				m('',_('The information has been accepted')),
				m('',_('Next and Prev buttons not available')),
			]),
			m('', {
				id: 'secret',
				title: _('Secret page'),
			}, [
				m('',_('This page is only accessible by jump')),
				m('',_('Because it is the last one, pressing next does nothing')),
				m('',_('Pressing prev, should go back to which ever page you come from')),
			]),
		])),
	]);
};




module.exports=Wizard
// vim: noet ts=4 sw=4
