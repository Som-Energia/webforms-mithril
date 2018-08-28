'use strict';
var m = require('mithril');
var _ = require('./translate');
var css = require('./style.styl');
var Layout = require('./mdc/layout');
var Row = Layout.Row;
var Cell = Layout.Cell;
var Button = require('./mdc/button');
var Select = require('./mdc/select');
var Checkbox = require('./mdc/checkbox');
var TextField = require('./mdc/textfield');
var ValidatedField = require('./validatedfield');
var Wizard = require('./wizard');
var StateCityChooser = require('./statecity');
var FarePower = require('./farepower');
var PersonEditor = require('./personeditor');
var Chooser = require('./chooser');
var Terms = require('./terms');
var Dialog = require('./mdc/dialog');
var Card = require('./mdc/card');
var LinearProgress = require('./mdc/linearprogress');
var Slider = require('./mdc/slider');
var TabBar = require('./mdc/tabbar');
var PageSlider = require('./pageslider');

require('font-awesome/css/font-awesome.css');
require('@material/typography/dist/mdc.typography.css').default;

var skip = function (c) { return []; }

var Examples = {
	view: function(vn) {
		return m('.form.mdc-typography', [
			m(Wizard.Example),
			m(TabBar.Example),
			m(PageSlider.Example),
			m(Slider.Example),
			skip(LinearProgress.Example),
			m(Dialog.Example),
			m(Card.Example),
			m(StateCityChooser.Example),
			m(Chooser.Example),
			m(Terms.Example),
			m(Checkbox.Example),
			m(Button.Example),
			m(TextField.Example),
			m(ValidatedField.Example),
			m(Select.Example),
			m(PersonEditor.Example),
			m(FarePower.Example),
		]);
	},
};


window.onload = function() {
	var element = document.getElementById("mithril-target");
	m.mount(element, Examples);
};
// vim: noet ts=4 sw=4
