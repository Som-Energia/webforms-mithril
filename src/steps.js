'use strict';
var m = require('mithril');
var _ = require('./translate');

var Layout = require('./mdc/layout');
var Row = Layout.Row;
var Cell = Layout.Cell;
var Button = require('./mdc/button');
var Fab = require('./mdc/fab');
var Pager = require('./pageslider');
var LinearProgress = require('./mdc/linearprogress');
var Snackbar = require('./mdc/snackbar');


/** @module */

/**
@namespace Steps
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

var Steps = {
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

		vn.state.snackbar = {};
		vn.state.errors = false;

		vn.state.focusonjump = vn.attrs.focusonjump === true;
		vn.state.nextonenter = vn.attrs.nextonenter === true;

		this.pages = vn.attrs.pages;
		this.pages.map(function(page) {
			vn.state.currentPage = vn.state.currentPage || page.id;
		});
		this.intransition = false;
		this.history = [];
	},
	nextOnEnter: function(vn){
		if(vn.state.nextonenter){
			Mousetrap.bindGlobal('enter', function() {
				let button = vn.dom.querySelector('.mdc-button--next');
				if(button)
				button.click();
			});
		}
	},
	oncreate: function(vn){
		this.nextOnEnter(vn);
	},
	onupdate: function(vn) {
		this.pages = vn.attrs.pages;
		this.nextOnEnter(vn);
	},
	view: function(vn) {
		var self = this;
		var currentIndex = self.pageIndex(self.currentPage);

		vn.state.errors = self.pages[currentIndex].validator && self.pages[currentIndex].validator();
		console.log('validator', currentIndex, vn.state.errors);

		if(vn.state.errors){
			if(vn.state.snackbar.open !== undefined) vn.state.snackbar.open();
		}else{
			if(vn.state.snackbar.close !== undefined) vn.state.snackbar.close();
		}

		var showNext = self.pages[currentIndex].next !== false;
		var showPrev = self.pages[currentIndex].prev !== false;

		return m('.wizard.steps' + (vn.attrs.showall?'.showall':''), { class: vn.attrs.className }, [
			m(LinearProgress, {
				max: vn.attrs.pages.length-1,
				value: currentIndex,
				loading: (vn.attrs.loading !== undefined) ? vn.attrs.loading : false
			}),
			m(Pager, {
				height: '100%',
				current: currentIndex,
				showall: vn.attrs.showall,
				focusonjump: vn.state.focusonjump,
			}, vn.attrs.pages.map(function(page) {
				var active = self.currentPage === page.id;

				return m(Layout, [
					m(Cell, {span:12}, page.title ? m('.header', [m('.header__container',m('.header__text', page.title)), m('.header__after')]) : ''),
					page.content,
					( showNext || showPrev ) ? m('.step__controls', [
						showNext ? m(Button, {
							raised:true,
							trailingicon: self.intransition?'spinner.fa-spin': (self.pages[currentIndex].nexticon||'navigate_next'),
							disabled: vn.state.errors !== undefined || self.intransition,
							onclick: function() { self.next(); },
							class: 'mdc-button--next  '
						},
							self.pages[currentIndex].nextlabel||_("Next")
						) : '',
						showPrev ? m(Button, {
							icon: 'navigate_before',
							disabled: !self.history.length || self.intransition,
							onclick: function() { self.prev(); },
							class: 'mdc-button--back  '
							},
							_("Previous")
						) : '',
					]) : ''
				]);
			})),
			m(Snackbar, { model: vn.state.snackbar, dismiss: true, leading: false, timeoutMs: 10000 } ,vn.state.errors)
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
			//return thing.then !== undefined;
			return thing !== undefined && typeof thing.then === 'function';
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


module.exports=Steps
// vim: noet ts=4 sw=4
