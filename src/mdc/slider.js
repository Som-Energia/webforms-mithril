'use strict';

var m = require('mithril');
var MDCSlider = require('@material/slider').MDCSlider;
require('@material/slider/dist/mdc.slider.css');


var Slider = {};
Slider.oncreate = function(vn) {
	// Temporary fix to https://github.com/material-components/material-components-web/issues/7603
	vn.dom.querySelector('input').setAttribute('value', vn.attrs.value);

	this.widget = new MDCSlider(vn.dom);
	this.widget.listen('MDCSlider:change', function(ev) {
		vn.attrs.onchange && vn.attrs.onchange(ev, vn.state.widget.getValue());
		m.redraw();
	});
	this.widget.listen('MDCSlider:input', function(ev) {
		vn.attrs.oninput && vn.attrs.oninput(ev, vn.state.widget.getValue());
		m.redraw();
	});
	this.onupdate(vn);
};
Slider.onupdate = function(vn) {
	// external set
	if (this.widget && this.widget.getValue() !== vn.attrs.value) {
		this.widget.setValue(vn.attrs.value);
	}
};
Slider.onremove = function(vn) {
	this.widget.destroy();
};
Slider.view = function(vn) {
	var min = vn.attrs.min !== undefined ? vn.attrs.min : 0;
	var max = vn.attrs.max !== undefined ? vn.attrs.max : 100;
	var value = vn.attrs.value !== undefined && vn.attrs.value !== null? vn.attrs.value : min;
	var step = vn.attrs.step;
	if (step) {
		max = max - (max-min) % step;
	}
	vn.state.widget && vn.state.widget.setValue(value)
	return m('.mdc-slider'
		+(vn.attrs.disabled?'.mdc-slider--disabled':'')
		+(vn.attrs.discrete?'.mdc-slider--discrete':'')
		+(vn.attrs.marked?'.mdc-slider--display-markers':'')
		, {
			/*
			value: value,
			role: 'slider',
			'aria-valuemin': min,
			'aria-valuemax': max,
			'aria-valuenow': value,
			'aria-value': value,
			'aria-step': vn.attrs.step,
			'data-step': vn.attrs.step,
			'aria-label': "Select Value",
			'aria-disabled': vn.attrs.disabled,
			*/
		}, [
		m('input.mdc-slider__input', {
			type: 'range',
			min: min,
			max: max,
			step: step,
			value: value,
			name: vn.attrs.name,
			'aria-label': vn.attrs.name,
			disabled: vn.attrs.disabled,
		}),

		m('.mdc-slider__track', [
			m('.mdc-slider__track--inactive',
				vn.attrs.color&&{style: {'background-color': vn.attrs.color}}
			),
			m('.mdc-slider__track--active',
				m('.mdc-slider__track--active_fill',
					vn.attrs.color&&{style: {'border-color': vn.attrs.color}},
				)
			),
			vn.attrs.marked && m('.mdc-slider__tick-marks',
				[...Array(Math.floor((max-min)/step)+1)].map((v,i) => m(
					(min+i*step<=value?
						'.mdc-slider__tick-mark.mdc-slider__tick-mark--active':
						'.mdc-slider__tick-mark.mdc-slider__tick-mark--inactive'),
					{
						key: i,
					}//, min+i*step // to show the numbers in the ticks
				)),
			),
		]),
		m('.mdc-slider__thumb',
			m('.mdc-slider__value-indicator-container[aria-hidden="true"]',
				m('.mdc-slider__value-indicator',
					m('span.mdc-slider__value-indicator-text',
						value
					)
				)
			),
			m('.mdc-slider__thumb-knob',
				vn.attrs.color&&{style: {'border-color': vn.attrs.color}},
			)
		),
	]);
};

Slider.Example = {};
Slider.Example.oninit = function(vn) {
	this.slider1 = 0;
	this.slider2 = 20;
	this.slider3 = 20;
	this.slider4 = 4;
	this.slider5 = 4;
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
	console.log("slider1:", this.slider1)
	return m(Layout,
		m(Layout.Row, m(Layout.Cell, m('h2', 'Sliders'))),
		m(Layout.Row, [
			m(Layout.Cell, {span: 12}, 'Continuous: '+ this.slider1, m(Slider,{
				name: 'continuous:',
				value: vn.state.slider1,
				oninput: function(ev, value) {
					vn.state.slider1 = value;
				},
			})),
			m(Layout.Cell, {span: 12}, 'Bounded: '+this.slider2, m(Slider, {
				name: 'bounded:',
				min:10, max:60,
				value: vn.state.slider2,
				oninput: function(ev, value) {
					vn.state.slider2 = value;
				},
			})),
			m(Layout.Cell, {span: 12}, 'Stepped: '+this.slider3, m(Slider, {
				name: 'stepped:',
				discrete: true,
				min:10, max:60, step:5, 
				value: vn.state.slider3,
				oninput: function(ev, value) {
					vn.state.slider3 = value;
				},
			})),
			m(Layout.Cell, {span: 12}, 'External: '+this.slider3, m(Slider, {
				name: 'external:',
				discrete: true,
				min:10, max:60, step:5, 
				value: vn.state.slider3,
				oninput: function(ev, value) {
					vn.state.slider3 = value;
				},
			})),
			m(Layout.Cell, {span: 12}, 'Marked: '+this.slider4, m(Slider, {
				name: 'marked:',
				discrete: true,
				marked: true,
				min:0, max:32, step: 4,
				value: vn.state.slider4,
				oninput: function(ev, value) {
					vn.state.slider4 = value;
				},
			})),
			m(Layout.Cell, {span: 12}, 'Using onchange instead of oninput: '+this.confirmedValue, m(Slider, {
				name: 'onchange:',
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
				name: 'disabled:',
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
					name: 'red:',
					discrete: true,
					min:0, max:255, step: 1,
					value: vn.state.red,
					color: 'red',
					oninput: function(ev, value) {
						vn.state.red = value;
					},
				}),
				m(Slider, {
					name: 'green:',
					discrete: true,
					min:0, max:255, step: 1,
					value: vn.state.green,
					color: '#00b100',
					oninput: function(ev, value) {
						vn.state.green = value;
					},
				}),
				m(Slider, {
					name: 'blue:',
					discrete: true,
					min:0, max:255, step: 1,
					value: vn.state.blue,
					color: 'blue',
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
