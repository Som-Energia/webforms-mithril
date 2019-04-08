'use strict';
/** @module */


const m = require('mithril');
require('./pageslider.styl');

/**
@namespace PageSlider
@description A widget sliding among several pages horizontally.

Pages slide gently from left to right or backwards from right to left
controlled by the `current` attribute.

A debug mode is available to show all pages stacked horizontally
where the current page is just hightlighted and the rest are dimished.

It can be used as base for a Carruselle, the panes controlled by a TabBar,
or the pages of a Wizard.

@property {int} current The index of the page to appear.
@property {bool} showall Show all pages, for debug purposes.
@property {vnode} __children__ The pages
@todo Remove the hidden pages from the tab order.
@see TabBar
@see Wizard
*/
const PageSlider = {};

PageSlider.oninit = function(vn) {
	vn.state.current = vn.attrs.current || 0;
	vn.state.model = vn.attrs.model || {};
	vn.state.height = vn.attrs.height;
	vn.state.focusonjump = vn.attrs.focusonjump || false;
};

function updateHeight(vn, mode) {

	var newHeight = Math.max.apply(Math,
		vn.children.map(function(child) {
			console.log(child.dom.offsetHeight);
			return child.dom.offsetHeight;
		}));

	/*	
	var newHeight = Math.max.apply(Math,
		vn.children.map(function(child,index) {
			return (vn.attrs.current===index?child.dom.clientHeight:0);
		}));*/

	if (newHeight && newHeight !== vn.state.height) {
		vn.state.height = newHeight;
		setTimeout(function() {m.redraw();});
	}
}

function disableFocus (vn) {
	const inputFilter = 'a[href], button, textarea, input, select';
	Array.from(vn.dom.querySelectorAll(inputFilter))
		.map( function(elem){
			elem.setAttribute('tabindex','-1');
		});
	
	Array.from(vn.dom.querySelector('.pageslider-page.active').querySelectorAll(inputFilter))
		.map( function(elem){
			elem.removeAttribute('tabindex');
		});
}

function firstFocusable(){
	var focusable = document.querySelector('.pageslider-page.active')
		.querySelectorAll('button, [href], input, select, textarea');
	if(focusable){
		// During the transition the inputs are disable
		setTimeout(function() {
			focusable[0].focus();			
		}, 800);
	} 
}

PageSlider.oncreate = function(vn) {
	updateHeight(vn, 'create');
	disableFocus(vn);
};

PageSlider.onupdate = function(vn) {
	updateHeight(vn, 'update');
	if(vn.state.current !== vn.attrs.current){
		vn.state.current = vn.attrs.current;
		if(vn.state.focusonjump) firstFocusable();
		disableFocus(vn);
	}
};

PageSlider.view = function(vn) {
	return m('.pageslider',
		//vn.attrs.showall ?'':{style: {height: vn.state.height+'px'}},
		vn.children.map(function(child,index) {
			return m('.pageslider-page'
				+(vn.attrs.showall?'.showall':'')
				+(vn.attrs.current===index?'.active':'')
				+(vn.attrs.current>index?'.back':'')
				+(vn.attrs.current<index?'.next':'')
				, {}, child);
		})
	);
};

PageSlider.Example = {};
PageSlider.Example.model = {};
PageSlider.Example.model.index = 0;
PageSlider.Example.model.showall = false;
PageSlider.Example.view = function() {
	const Layout = require('./mdc/layout');
	const TabBar = require('./mdc/tabbar');
	const Checkbox = require('./mdc/checkbox');
	return m(Layout, [
		m('h2', 'Page Slider'),
		m(Checkbox, {
			id: 'showallmode',
			label: 'Showall mode',
			checked: PageSlider.Example.model.showall,
			onchange: function(ev) {PageSlider.Example.model.showall = ev.target.checked; },
		}),
		m(TabBar, {
			index: PageSlider.Example.model.index,
			onactivated: function(ev) {
                PageSlider.Example.model.index = ev.detail.index;
            },
			align: 'expand',
			tabs: [{
				id: 'sliderpage1',
				text: 'Page 1',
			},{
				id: 'sliderpage2',
				text: 'Page 2',
			},{
				id: 'sliderpage3',
				text: 'Page 3',
			}]
		}),
		m(PageSlider, {
			current: PageSlider.Example.model.index,
			showall: PageSlider.Example.model.showall,
			height: 100,
		}, [
			m('h1', {style: 'background-color: red;'}, 'Page 1'),
			m('',[
				m('h1', {style: 'background-color: green;'}, 'Page 2'),
				m('h1', {style: 'background-color: green;'}, 'Longer'),
				m('h1', {style: 'background-color: green;'}, 'Longer'),
			]),
			m('h1', {style: 'background-color: blue;'}, 'Page 3'),
		]),
	]);
		
};



module.exports=PageSlider;
