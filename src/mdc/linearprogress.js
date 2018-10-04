'use strict';
/** @module */

var m = require('mithril');
var MDCLinearProgress = require('@material/linear-progress').MDCLinearProgress;
require('@material/linear-progress/dist/mdc.linear-progress.css');

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
LinearProgress.onremove = function(vn) {
	this.widget.destroy();
};

LinearProgress.view = function(vn) {
	return m('[role="progressbar"].mdc-linear-progress'
		+(vn.attrs.max===undefined?'.mdc-linear-progress--indeterminate':'')
		+(vn.attrs.reversed?'.mdc-linear-progress--reversed':'')
		+(vn.attrs.closed?'.mdc-linear-progress--closed':'')
		, vn.attrs, [
		m('.mdc-linear-progress__buffering-dots'),
        m('.mdc-linear-progress__buffer',
			vn.attrs.color2 && {style: {'background-color': vn.attrs.color2}}
		),
		m('.mdc-linear-progress__bar.mdc-linear-progress__primary-bar',
			m('span.mdc-linear-progress__bar-inner',
				vn.attrs.color && {style: {'background-color': vn.attrs.color}}
			)
		),
		m('.mdc-linear-progress__bar mdc-linear-progress__secondary-bar',
			m('span.mdc-linear-progress__bar-inner'),
		),
	]);
};

LinearProgress.Example = {};
LinearProgress.Example.oninit = function(vn) {
	this.value1 = 0;
	function tick() {
		vn.state.value1++;
		vn.state.value1%=51;
		setTimeout(tick, 5000);
		m.redraw();
	}
	setTimeout(tick, 5000);
};
LinearProgress.Example.view = function(vn) {
	var Layout = require('./layout');
	return m(Layout,
		m(Layout.Cell, m('h2', 'Linear Progress ')),
		m(Layout.Row, [
			false && m(Layout.Cell, {span: 12}, 'Indeterminate', m(LinearProgress)),
			m(Layout.Cell, {span: 12}, 'Determinate', m(LinearProgress, {max:50, value: vn.state.value1})),
			m(Layout.Cell, {span: 12}, 'Buffer', m(LinearProgress, {max:50, buffer: vn.state.value1-vn.state.value1%3, value: vn.state.value1/4*3}), 'Undertext'),
			m(Layout.Cell, {span: 12}, 'Reversed', m(LinearProgress, {reversed: true, max:50, value: vn.state.value1})),
			m(Layout.Cell, {span: 12}, 'Colored', m(LinearProgress, {max:50, value: vn.state.value1, color: 'red', color2: 'orange'})),
			m(Layout.Cell, {span: 12}, 'Colored Buffer', m(LinearProgress, {color: 'red', color2: 'orange', max:50, buffer: vn.state.value1-vn.state.value1%3, value: vn.state.value1/4*3})),
			m(Layout.Cell, {span: 12}, 'Wide', m(LinearProgress, {style: 'height: 8pt;', max:50, value: vn.state.value1})),
		]),
	);
};


module.exports=LinearProgress;

// vim: noet ts=4 sw=4
