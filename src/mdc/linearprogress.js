'use strict';
/** @module */

var m = require('mithril');
require('@material/linear-progress/dist/mdc.linear-progress.css');
var MDCLinearProgress = require('@material/linear-progress').MDCLinearProgress;

/**
@namespace LinearProgress
@description A Material Design LinearProgress wrapped as Mithril component.

A LinearProgress gives feedback on the proces of some ongoing process.
It can display either a concrete progress (% of completion) or an
indeterminate one (just feeds back that the process is ongoing.

![screenshot](../docs/shots/mdc-linearprogress.png)

@property {undefined|int} - Number of total steps.
	If not defined, the progres will feedback an undeterminate length process.
@property {int} value - Number of completed steps.
@property {int} buffer - Number of steps preprocessed in advance.
	Commonly used in streaming media playback.
@property {bool} reversed - Invert left-right
@property {bool} closed - Hides the widget
@property {color} color - Color for the progress line
@property {color2} color2 - Color for the buffer line
*/
var LinearProgress = {};
LinearProgress.oncreate = function(vn) {
	this.widget = MDCLinearProgress.attachTo(vn.dom);
	this.onupdate(vn);
};
LinearProgress.onupdate = function(vn) {
	if (vn.attrs.max !== undefined) {
		this.widget.progress = vn.attrs.value/vn.attrs.max;
		if (vn.attrs.buffer !== undefined) {
			this.widget.buffer = vn.attrs.buffer/vn.attrs.max;
		}
	}
};
LinearProgress.onbeforeremove = function(vn) {
	this.widget.destroy();
};

LinearProgress.view = function(vn) {
	return m('[role="progressbar"].mdc-linear-progress'
		+(vn.attrs.max===undefined || vn.attrs.loading ?'.mdc-linear-progress--indeterminate':'')
		+(vn.attrs.closed?'.mdc-linear-progress--closed':'')
		+(vn.attrs.reversed?'[dir="rtl"]':'')
		, {
			...vn.attrs,
			style: {
				...vn.attrs?.style,
				height: vn.attrs.height,
			},
		}, [
        m('.mdc-linear-progress__buffer',
			m('.mdc-linear-progress__buffer-bar', {
				style: {
					height: vn.attrs.height,
					'background-color': vn.attrs.color2,
				},
			}),
			m('.mdc-linear-progress__buffer-dots'),
		),
		m('.mdc-linear-progress__bar.mdc-linear-progress__primary-bar',
			m('span.mdc-linear-progress__bar-inner', {
				style: {
					'border-top-width': vn.attrs.height,
					'--mdc-theme-primary': vn.attrs.color,
				},
			}),
		),
		m('.mdc-linear-progress__bar mdc-linear-progress__secondary-bar',
			m('span.mdc-linear-progress__bar-inner', {
				style: {
					'border-top-width': vn.attrs.height,
					'--mdc-theme-primary': vn.attrs.color3
				}
			}),
		),
	]);
};

LinearProgress.Example = {};
LinearProgress.Example.oninit = function(vn) {
	this.value1 = 0;
	function tick() {
		vn.state.value1++;
		vn.state.value1%=51;
		setTimeout(tick, 100);
		m.redraw();
	}
	setTimeout(tick, 100);
};
LinearProgress.Example.view = function(vn) {
	var Layout = require('./layout');
	return m(Layout,
		m(Layout.Cell, m('h2', 'Linear Progress ')),
		m(Layout.Row, [
			m(Layout.Cell, {span: 12}, 'Indeterminate', m(LinearProgress)),
			m(Layout.Cell, {span: 12}, 'Determinate', m(LinearProgress, {max:50, value: vn.state.value1})),
			m(Layout.Cell, {span: 12},
				'Buffer',
				m(LinearProgress, {
					max:50, buffer: vn.state.value1-vn.state.value1%3, value: vn.state.value1/4*3
				}),
				'Undertext'),
			m(Layout.Cell, {span: 12}, 'Reversed', m(LinearProgress, {reversed: true, max:50, value: vn.state.value1})),
			m(Layout.Cell, {span: 12}, 'Colored', m(LinearProgress, {max:50, value: vn.state.value1, color: 'blue', color2: 'orange', color3: 'blue'})),
			m(Layout.Cell, {span: 12}, 'Colored Buffer', m(LinearProgress, {color: 'blue', color2: 'orange', color3: 'red', max:50, buffer: vn.state.value1-vn.state.value1%3, value: vn.state.value1/4*3})),
			m(Layout.Cell, {span: 12}, 'Colored Indeterminate', m(LinearProgress, {color: 'blue', color2: 'orange', color3: 'red'})),
			m(Layout.Cell, {span: 12}, 'Wide', m(LinearProgress, {height: '8pt', max:50, value: vn.state.value1})),
			m(Layout.Cell, {span: 12}, 'Wide Buffer', m(LinearProgress, {height: '8pt', max:50, buffer: vn.state.value1-vn.state.value1%3, value: vn.state.value1/4*3})),
			m(Layout.Cell, {span: 12}, 'Wide Indeterminate', m(LinearProgress, {height: '8pt'})),
		]),
	);
};


module.exports=LinearProgress;

// vim: noet ts=4 sw=4
