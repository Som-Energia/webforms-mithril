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
var DatePicker = require('./datepicker');

require('font-awesome/css/font-awesome.css');
require('@material/typography/dist/mdc.typography.css').default;

var traceFocus = require('./debughelpers').traceFocus;

var skip = function (c) { return []; }

var Examples = {
	view: function(vn) {
		return m('.form.mdc-typography', [
			skip(Wizard.Example),
			skip(TabBar.Example),
			skip(PageSlider.Example),
			skip(Slider.Example),
			skip(LinearProgress.Example),
			skip(Dialog.Example),
			skip(Card.Example),
			skip(StateCityChooser.Example),
			skip(Chooser.Example),
			skip(Terms.Example),
			skip(Checkbox.Example),
			skip(Button.Example),
			skip(TextField.Example),
			skip(ValidatedField.Example),
			skip(Select.Example),
			skip(PersonEditor.Example),
			skip(FarePower.Example),
			m(DatePicker.Example),
		]);
	},
};


window.onload = function() {
	var element = document.getElementById("mithril-target");
	m.mount(element, Examples);
	//traceFocus();
};
// vim: noet ts=4 sw=4
