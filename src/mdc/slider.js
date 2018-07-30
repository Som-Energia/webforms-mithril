'use strict';

var m = require('mithril');
var MDCSlider = require('@material/slider').MDCSlider;
require('@material/slider/dist/mdc.slider.css');


var Slider = {};
Slider.oncreate = function(vn) {
	this.widget = MDCSlider.attachTo(vn.dom);
	this.widget.listen('MDCSlider:change', function(ev) {
		vn.attrs.onchange && vn.attrs.onchange(ev, vn.state.widget.value);
		m.redraw();
	});
	this.widget.listen('MDCSlider:input', function(ev) {
		vn.attrs.oninput && vn.attrs.oninput(ev, vn.state.widget.value);
		m.redraw();
	});
	this.onupdate(vn);
};
Slider.onupdate = function(vn) {
	// external set
	if (this.widget.value!==vn.attrs.value) {
		this.widget.value = vn.attrs.value;
	}
};
Slider.onremove = function(vn) {
	this.widget.destroy();
};

Slider.view = function(vn) {
	return m('.mdc-slider'
		+(vn.attrs.discrete?'.mdc-slider--discrete':'')
		+(vn.attrs.marked?'.mdc-slider--display-markers':'')
		, {
			tabindex: 0,
			role: 'slider',
			'aria-valuemin': vn.attrs.min,
			'aria-valuemax': vn.attrs.max,
			'aria-valuenow': vn.attrs.value,
			'aria-step': vn.attrs.step,
			'data-step': vn.attrs.step,
			'aria-label': "Select Value",
			'aria-disabled': vn.attrs.disabled,
		}, [

		m('.mdc-slider__track-container', [
			m('.mdc-slider__track'),
			vn.attrs.marked && m('.mdc-slider__track-marker-container'),
		]),
		m('.mdc-slider__thumb-container', [
			m('.mdc-slider__pin', m('span.mdc-slider__pin-value-marker', 'ca'+vn.attrs.value)),
			m('svg.mdc-slider__thumb[width="21"][height="21"]',
			  m('circle', {cx:10.5,cy:10.5,r:7.875})
			),
			m('.mdc-slider__focus-ring')
		]),
	]);
};

Slider.Example = {};
Slider.Example.oninit = function(vn) {
	this.slider1 = 0;
	this.slider2 = 20;
	this.slider3 = 20;
	this.slider4 = 2;
	this.slider5 = 2;
	this.confirmedValue = 2;
	this.red = 142;
	this.green = 100;
	this.blue = 32;
};
Slider.Example.view = function(vn) {
	var Layout = require('./layout');
	var color = function() {
		return '#'+('000'+(
			+256*256*vn.state.red
			+256*vn.state.green
			+vn.state.blue
			).toString(16)).slice(-6)
		;
	};
	return m(Layout,
		m(Layout.Row, m(Layout.Cell, m('h2', 'Sliders'))),
		m(Layout.Row, [
			m(Layout.Cell, {span: 12}, 'Continuous: '+ this.slider1, m(Slider,{
				value: vn.state.slider1,
				oninput: function(ev, value) {
					vn.state.slider1 = value;
				},
			})),
			m(Layout.Cell, {span: 12}, 'Bounded: '+this.slider2, m(Slider, {
				min:10, max:60,
				value: vn.state.slider2,
				oninput: function(ev, value) {
					vn.state.slider2 = value;
				},
			})),
			m(Layout.Cell, {span: 12}, 'Stepped: '+this.slider3, m(Slider, {
				discrete: true,
				min:10, max:60, step:5, 
				value: vn.state.slider3,
				oninput: function(ev, value) {
					vn.state.slider3 = value;
				},
			})),
			m(Layout.Cell, {span: 12}, 'External: '+this.slider3, m(Slider, {
				discrete: true,
				min:10, max:60, step:5, 
				value: vn.state.slider3,
				oninput: function(ev, value) {
					vn.state.slider3 = value;
				},
			})),
			m(Layout.Cell, {span: 12}, 'Marked: '+this.slider4, m(Slider, {
				discrete: true,
				marked: true,
				min:0, max:30, step: 4,
				value: vn.state.slider4,
				oninput: function(ev, value) {
					vn.state.slider4 = value;
				},
			})),
			m(Layout.Cell, {span: 12}, 'Using onchange instead of oninput: '+this.confirmedValue, m(Slider, {
				discrete: true,
				marked: true,
				min:0, max:30, step: 4,
				value: vn.state.slider5,
				oninput: function(ev, value) {
					vn.state.slider5 = value;
				},
				onchange: function(ev, value) {
					// do your action here, trust oninput
					// Setting slider5 would stall the slider
					vn.state.confirmedValue = value;
				},
			})),
			m(Layout.Cell, {span: 12}, 'Disabled: '+this.slider5, m(Slider, {
				disabled: true,
				min:0, max:30, step: 4,
				value: vn.state.slider5,
				oninput: function(ev, value) {
					vn.state.slider5 = value;
				},
			})),
			m(Layout.Cell, {span: 9}, [
				m('','Pick a color'),
				m(Slider, {
					discrete: true,
					min:0, max:255, step: 1,
					value: vn.state.red,
					oninput: function(ev, value) {
						console.log("Updating red", value);
						vn.state.red = value;
					},
				}),
				m(Slider, {
					discrete: true,
					min:0, max:255, step: 1,
					value: vn.state.green,
					oninput: function(ev, value) {
						vn.state.green = value;
					},
				}),
				m(Slider, {
					discrete: true,
					min:0, max:255, step: 1,
					value: vn.state.blue,
					oninput: function(ev, value) {
						vn.state.blue = value;
					},
				}),
			]),
			m(Layout.Cell, {span: 3}, [
				m('.mdc-typography--headline5', { style: {
					'background-color': color(),
					width: '100%',
					height: '100%',
					'text-align': 'center',
					color: (
						(vn.state.red*299)+
						(vn.state.green*587)+
						(vn.state.blue*114))
						/1000>=128?'black':'white',
				}}, color()),
			]),
		]),
	);
};


module.exports=Slider;

// vim: noet ts=4 sw=4
