'use strict';

const m = require('mithril');
require('./pageslider.styl');


const PageSlider = {};

PageSlider.oninit = function(vn) {
	console.log('init');
	vn.state.current = vn.attrs.current || 0;
	vn.state.model = vn.attrs.model || {};
	vn.state.height = vn.attrs.height;
};

function updateHeight(vn, mode) {
	var newHeight = vn.state.height = Math.max.apply(Math,
		vn.children.map(function(child) {
			console.log(child.dom.offsetHeight, child.dom);
			return child.dom.offsetHeight+50;
		}));
	console.log('height', mode, vn.state.height, newHeight);
	if (newHeight && newHeight !== vn.state.height) {
		vn.state.height = newHeight;
		m.redraw();
	}
}


PageSlider.oncreate = function(vn) {
	// TODO: This does not work as expected
	updateHeight(vn, 'create');
};
PageSlider.onupdate = function(vn) {
	updateHeight(vn, 'update');
};

PageSlider.view = function(vn) {
	return m('.pageslider', {style: {height: vn.state.height+'px'}},
		vn.children.map(function(child,index) {
			return m('.pageslider-page'
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
PageSlider.Example.view = function() {
	const Layout = require('./mdc/layout');
	const TabBar = require('./mdc/tabbar');
	return m(Layout, [
		m('h2', 'Page Slider'),
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
