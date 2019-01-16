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


/** @module */

/**
@namespace Wizard
@description Controls the progress of user interaction within a serie of steps.

- The default flow matches the order of the array of pages
- You can alter this order by setting attributes on the steps.
- You can perform validations on each page
- You can perform exit actions on each page

@property {bool} showall Ahow all pages, for debug purposes

@property {Object} model A dictionary that will be populated with the public api functions

- jump(pageid) jumps to the next page (uses `pageid` as the `next` attribute)
- `next()`: jumps to next page
- `prev()`: jumps to previous page in history
- `current()`: returns the id of the current page

@property {Object[]} pages
A list of Objects for each page.

@property {string} pages.id  The page id, it is important to set it
@property {string} pages.title  The title to be displayed for the step
@property {string} pages.nexticon  Font awesome icon name for the next button. Default 'chevron-right'
@property {string} pages.nextlabel  Label for the next button. Default: 'Next'
@property {function} pages.skipif  Jumping to this page by order, just jumps to the next in order
@property {function} pages.validator  Returns either false or a reason why you cannot advance.
If an error message is returned it will be displayed and the 'Next' button will be disabled.
If it returns undefined, the 'Next' button will be enabled.
Default: `function() {}`
@property {undefined|bool|string|funcion|promise} pages.next
	Changes the normal flow for the next step
- `undefined` or `true`: just go to the next in order
- `false`: do not jump at all
- `string`: jump to the page with such id
- `function`: execute the function that returns the page (any of the other)
- `promise`: freezes the buttons and jump when the promise resolves, or stays if fails
@property {bool|undefined} pages.prev  If defined false, it cannot go back.
@property {vnode|vnode[]|string} pages.content Content of the page
*/

var Wizard = {
	onupdate: function(vn) {
		this.pages = vn.attrs.pages;
	},
	oninit: function(vn) {
		var self = this;
		self.model = vn.attrs.model || {};
		// public api
		self.model.jump = function(value) {
			self.goNext(value);
		};
		self.model.next = function() {
			self.next();
		};
		self.model.prev = function() {
			self.prev();
		};
		self.model.current = function() {
			return vn.state.currentPage;
		};

		this.pages = vn.attrs.pages;
		this.pages.map(function(page) {
			vn.state.currentPage = vn.state.currentPage || page.id;
		});
		this.intransition = false;
		this.history = [];
	},
	view: function(vn) {
		var self = this;
		var currentIndex = self.pageIndex(self.currentPage);
		return m('.wizard', [
			m(LinearProgress, {
				max: vn.attrs.pages.length-1,
				value: currentIndex,
			}),
			m(Pager, {
				current: currentIndex,
				showall: vn.attrs.showall,
			}, vn.attrs.pages.map(function(page) {
				var active = self.currentPage === page.id;
				var errors = page.validator && page.validator();
				var showNext = page.next !== false;
				var showPrev = page.prev !== false;
				return m(Layout, [
					m(Cell, {span:12}, m('h2', page.title)),
					page.content,
					m(Row, {align: 'right', style: 'margin-top:23px' }, [
						m(Cell,{span: 2, spanphone:2},
							showPrev && m(Button, {
								outlined: true,
								faicon: 'chevron-left',
								tabindex: 0,
								disabled: !self.history.length || self.intransition,
								onclick: function() { self.prev(); },
								style: {width:'100%'},
							},  _("Previous")),
						),
						m(Cell,{spandesktop: 8, span:4, order: 1, style: 'text-align: right'}, m('.red', errors)),
						m(Cell,{span: 2, spanphone:2},
							showNext && m(Button, {
								raised:true,
								trailingfaicon: self.intransition?'spinner.fa-spin': (page.nexticon||'chevron-right'),
								tabindex: 0,
								disabled: errors !== undefined || self.intransition,
								onclick: function() { self.next(); },
								style: {width:'100%'},
								},
								page.nextlabel||_("Next")
							)
						),
					]),
				]);
			})),
		]);
	},
	page: function(pageid) {
		return this.pages.find(function(child) {
			return child.id===pageid;
		});
	},
	pageIndex: function(pageid) {
		var index = this.pages.findIndex(function(child) {
			return child.id === pageid;
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
			if (page.skipif !== undefined) {
				return ! page.skipif();
			}
			return true;
		})
		if (next===undefined) return false; // we were at the last one, do not move
		return next.id;
	},
	next: function() {
		function isPromise(thing) {
			return thing.then !== undefined;
		}
		var self = this;
		var currentPage = self.page(self.currentPage);
		var nextAttribute = currentPage.next;
		// default value
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
		m(Layout.Cell, {span: 2}, 
			m('button',{
				onclick: function() { vn.state.wizardModel.jump('secret'); },
			},_('Jump to the secret page'))
		),
		m(Layout.Cell, {span: 2}, 
			m('button',{
				onclick: function() { vn.state.wizardModel.prev(); },
			},_('Go back'))
		),
		m(Layout.Cell, {span: 2}, 
			m('button',{
				onclick: function() { vn.state.wizardModel.next(); },
			},_('Go next'))
		),
		m(Layout.Cell, {span: 2}, 
			m('', _('Current page id: '), vn.state.wizardModel.current && vn.state.wizardModel.current())
		),
		m(Layout.Cell, {span: 12}, m(Wizard, {
			showall: vn.state.showall,
			model: vn.state.wizardModel,
			pages: [{
				id: 'page1',
				title: _('Page 1: Default page'),
				validator: function() {
					return vn.state.clearerror?undefined:
						_('You must mark the check');
				},
				content: [
					m('',_('No next, just by order')),
					m(Checkbox, {
						id: 'wizardexample_errorpage1',
						label: _('Mark this to be able to go on'),
						checked: vn.state.clearerror,
						onchange: function(ev) {vn.state.clearerror=ev.target.checked;},
					}),
				],
			},{
				id: 'page2',
				title: _('Page 2: Default but next have skipif'),
				content: [
					m('', _('By default, next go to page 3')),
					m(Checkbox, {
						id: 'wizardexample_skippage3',
						label: _('Skip page 3'),
						checked: vn.state.skippage3,
						onchange: function(ev) {vn.state.skippage3=ev.target.checked;},
					}),
				],
			},{
				id: 'page3',
				title: _('Page 3: Explicit next'),
				skipif: function() {return vn.state.skippage3;},
				next: vn.state.skippage4?'page5':true,
			 	content: [
					m('', _('next is set to a conditional expression, computed on render')),
					m('', _('If you check this, the result is `\'page5\'`, if not, `true` meaning normal flow')),
					m('', _('Current value: %{value}', {value: vn.state.skippage4?'page5':true})),
					m(Checkbox, {
						id: 'wizardexample_skippage4',
						label: _('Skip page 4'),
						checked: vn.state.skippage4,
						onchange: function(ev) {vn.state.skippage4=ev.target.checked;},
					}),
				]
			}, {
				id: 'page4',
				title: _('Page 4: Functional next'),
				next: function() { return vn.state.skippage5?'page6':true; },
				content: [
					m('', _('next is a function that is only evaluated when you click it')),
					m(Checkbox, {
						id: 'wizardexample_skippage5',
						label: _('Skip page 5'),
						checked: vn.state.skippage5,
						onchange: function(ev) {vn.state.skippage5=ev.target.checked;},
					}),
				]
			},{
				id: 'page5',
				title: _('Page 5: Asynchronous jump'),
				next: function() {
					return new Promise(function(accept, reject) {
						setTimeout(function() {
							accept(vn.state.skippage6?'confirm':true);
						}, 2000);
					});
				},
			    content: [
					m('', _('')),
					m(Checkbox, {
						id: 'wizardexample_skippage6',
						label: _('Skip page 6'),
						checked: vn.state.skippage6,
						onchange: function(ev) {vn.state.skippage6=ev.target.checked;},
					}),
				],
			},{
				id: 'page6',
				title: _('Page 6: Complex validation'),
				validator: function() {
					if (vn.state.farepower) {
						return vn.state.farepower.error;
					}
				},
				content: [
					m(FarePower, {model: vn.state.farepower})
				],
			}, {
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
				content: [
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
				],
			}, {
				id: 'error',
				title: _('Error'),
				prev: vn.state.recoverableError,
				next: false,
				content: [
					m('',_('Error while sending wizard info')),
					m('',_('Next button not available')),
				],
			}, {
				id: 'success',
				title: _('Succes!!'),
				prev: false,
				next: false,
				content: [
					m('',_('The information has been accepted')),
					m('',_('Next and Prev buttons not available')),
				],
			}, {
				id: 'secret',
				title: _('Secret page'),
				content: [
					m('',_('This page is only accessible by jump')),
					m('',_('Because it is the last one, pressing next does nothing')),
					m('',_('Pressing prev, should go back to which ever page you come from')),
				],
			}, 
		]})),
	]);
};




module.exports=Wizard
// vim: noet ts=4 sw=4
