'use strict';
var m = require('mithril');
var _ = require('../translate');
var MDCTextField = require('@material/textfield');
require('@material/textfield/dist/mdc.textfield.css');

/*
 * TODO:
 * - fix: outline ellipse labels
 * - fix: outline not updated on programmatic filling/clear
 * - fullwidth version
 */

function applyInputFilter(input, inputfilter, event) {
	var filtered = inputfilter instanceof Function?
		inputfilter(input.value) :
		(RegExp(inputfilter).test(input.value) && input.value);

	if (filtered!==false) {
		input.value = filtered;
		input.oldValue = filtered;
		input.oldSelectionStart = input.selectionStart;
		input.oldSelectionEnd = input.selectionEnd;
	} else if (input.hasOwnProperty("oldValue")) {
		input.value = input.oldValue;
		input.setSelectionRange(input.oldSelectionStart, input.oldSelectionEnd);
	}
}

function setInputFilter(textbox, inputfilter) {
	[
		//"input", // Let the widget handle that
		"keydown", "keyup",
		"mousedown", "mouseup", "select",
		"contextmenu", "drop"
	].forEach(function(event) {
		textbox.addEventListener(event, function() {
			applyInputFilter(this, inputfilter);
		});
	});
}


var TextField = {
	oncreate: function(vn) {
		var mdcinput = vn.dom.querySelector('.mdc-text-field');
		this.mdcinstance = new MDCTextField.MDCTextField(mdcinput);
		var errormessage = vn.attrs.errormessage || vn.state.errormessage || '';
		vn.state.mdcinstance.valid = !errormessage;
		vn.state.native = vn.dom.querySelector('.mdc-text-field__input');
		vn.state.native.setCustomValidity(errormessage);

		var inputfilter = vn.attrs.inputfilter;
		if (inputfilter) {
			setInputFilter(vn.state.native, inputfilter);
		}
	},

	onbeforeremove: function(vn) {
		this.mdcinstance.destroy();
	},

	onupdate: function(vn) {
		var errormessage = vn.attrs.errormessage || vn.state.errormessage || '';
		var valid = !errormessage;
		if (vn.state.mdcinstance.valid !== !errormessage) {
			vn.state.mdcinstance.valid = !errormessage;
		}
		vn.state.native = vn.dom.querySelector('.mdc-text-field__input');
		vn.state.native.setCustomValidity(errormessage);
	},

	view: function (vn) {
		function floats() {
			if (vn.attrs.value!==undefined && vn.attrs.value!=="") return true;
			if (!vn.dom) return false;
			if (!vn.state.native) return false;
			if (!vn.state.native===document.activeElement) return true;
			if (!vn.state.native.value) return true;
			return false;
		}
		var attrs = Object.assign({}, vn.attrs);
		// Remove the custom attributes no to be applied to the native input
		function pop(o,k) { var r=o[k]; if (r!==undefined) { delete o[k];} return r; }
		const floating = floats();
		const fullwidth = pop(attrs, 'fullwidth');
		const boxed = pop(attrs, 'boxed');
		const outlined = pop(attrs, 'outlined') || !boxed;
		const errormessage = pop(attrs, 'errormessage') || vn.state.errormessage;
		const dense = pop(attrs, 'dense');
		const disabled = pop(attrs, 'disabled');
		const help = pop(attrs, 'help');
		const faicon = pop(attrs, 'faicon');
		const trailingicon = pop(attrs, 'trailingicon');
		const iconaction = pop(attrs, 'iconaction');
		const leadingfaicon = pop(attrs, 'leadingfaicon');
		const leadingicon = pop(attrs, 'leadingicon');
		const inputfilter = pop(attrs, 'inputfilter');
		const prefix = pop(attrs, 'prefix');
		const suffix = pop(attrs, 'suffix');
		const help_id = vn.attrs.id+'_help';
		const nativeattrs = Object.assign({
			// defaults
			type: 'text',
			placeholder: fullwidth?vn.attrs.label:undefined,
			'aria-label': fullwidth?vn.attrs.label:undefined,
			'aria-controls': help_id,
			'aria-describedby': help_id,
			'aria-labelledby': vn.attrs.id,
		}, attrs, {
			// redefined
			oninput: function(ev) {
				applyInputFilter(ev.target, inputfilter);
				ev.target.setCustomValidity('');
				if (attrs.oninput) attrs.oninput(ev);
				vn.state.errormessage = ev.target.validationMessage;
			},
		});

		const handleIconClick = (ev) => {
			iconaction(ev);
			ev.cancelBubble = true;
		}

		return m('', [
			m(''
				+'label.mdc-text-field'
				+(vn.attrs.value?'.mdc-text-field--label-floating':'')
				+(fullwidth?'.mdc-text-field--fullwidth':'')
				+(boxed?'.mdc-text-field--filled':'')
				+(outlined?'.mdc-text-field--outlined':'')
				+(faicon||trailingicon?'.mdc-text-field--with-trailing-icon':'')
				+(leadingfaicon||leadingicon?'.mdc-text-field--with-leading-icon':'')
				+(dense?'.mdc-text-field--dense':'')
				+(disabled?'.mdc-text-field--disabled':'')
			,{
				style: { width: '100%'},
			},[
				(boxed ? m('span.mdc-text-field__ripple'):''),
				(boxed ? m('span.mdc-floating-label'
					+(vn.attrs.value?'.mdc-floating-label--float-above':'')
					, vn.attrs.label):''),
				(outlined ? m('span.mdc-notched-outline', [
					m('span.mdc-notched-outline__leading'),
					m('span.mdc-notched-outline__notch',
						m('span.mdc-floating-label'
							+(vn.attrs.value?'.mdc-floating-label--float-above':'')
							, vn.attrs.label),
					),
					m('span.mdc-notched-outline__trailing'),
				]):''),
				(leadingfaicon ? m('i.mdc-text-field__icon.mdc-text-field__icon--trailing.fa.fa-'+leadingfaicon):''),
				(leadingicon ? m('i.mdc-text-field__icon.mdc-text-field__icon--trailing.material-icons',leadingicon):''),
				prefix && m('span.mdc-text-field__affix.mdc-text-field__affix--prefix', prefix),
				m('input.mdc-text-field__input'
					+(floats?'.mdc-text-field--label-floating':'')
					, nativeattrs
				),
				suffix && m('span.mdc-text-field__affix.mdc-text-field__affix--suffix', suffix),
				(faicon && m('i.mdc-text-field__icon.mdc-text-field__icon--trailing.fa.fa-'+faicon,
					iconaction && {tabindex:0, role: 'button', onclick: handleIconClick}
				)),
				(trailingicon && m('i.mdc-text-field__icon.mdc-text-field__icon--trailing.material-icons',
					iconaction && {tabindex:0, role: 'button', onclick: handleIconClick},
					trailingicon
				)),
				boxed && m('span.mdc-line-ripple'),
			]),
			m('.mdc-text-field-helper-line',
				m('.mdc-text-field-helper-text'+
					'.mdc-text-field-helper-text--persistent'+ // else on focus
					(errormessage?'.mdc-text-field-helper-text--validation-msg':'')+
					'', {
					id: help_id,
					'aria-hidden': true,
					},
					errormessage || help || m.trust('&nbsp;')
				),
			),
		]);
	},
};

TextField.Example = {};
TextField.Example.oninit = function(vn) {
	vn.state.value3="Initial Value";
};
TextField.Example.view = function(vn) {
	var Button = require('./button');
	const Layout = require('./layout');
	return m(Layout, m('h2', 'TextFields'),
		m(Layout.Row, [
			{
				id: 'errormessageexample',
				outlined: true,
				label: _('Attribute errormessage'),
				help: _('Setting the error as attribute'),
				errormessage: 'You guilty',
			},
			{
				id: 'required',
				outlined: true,
				label: _('Required field'),
				required: true,
			},
			{
				id: 'number',
				outlined: true,
				label: _('Numeric field'),
				type: 'number',
				min: 5,
				max: 12,
			},
			{
				id: 'binary',
				outlined: true,
				label: _('Binary Regexp'),
				pattern: '[01]*',
			},
			{
				id: 'email',
				boxed: true,
				label: _('Email'),
				type: 'email',
				oninput: function(ev) {
					vn.state.value1error = ev.target.validationMessage;
				},
			},
			{
				id: 'inputvalidator',
				label: _('Standard and custom validation'),
				boxed: true,
				value: vn.state.value1,
				inputfilter: '[^d]*', // you can not input dees
				pattern: '[^p]*', // standard complains on pees
				oninput: function(ev) {
					// custom complains on tees
					if (ev.target.value.indexOf('t')!==-1) {
						ev.target.setCustomValidity('\'t\' are forbidden');
					}
					vn.state.value1=ev.target.value;
					vn.state.value1error = ev.target.validationMessage;
				},
				help: _('not pees, tees, or dees'),
			},
			{
				id: 'inputfilter',
				label: _('Input filter'),
				boxed: true,
				value: vn.state.value2,
				inputfilter: /[01]*/, // allows incomplete answers
				pattern: "[01]{0,6}1", // more restritive, final validation
				oninput: function(ev) {
					vn.state.value2 = ev.target.value;
					vn.state.value2error = ev.target.validationMessage;
				},
				help: 'Quick input filter with a regexp',
			},
			{
				id: 'inputfilterfunction',
				boxed: true,
				label: _('input filter function'),
				help: _('Binary turns o into 0 and i into 1'),
				value: vn.state.value2,
				inputfilter: function(value) {
					return value
						.replace('i','1','g')
						.replace('I','1','g')
						.replace('o','0','g')
						.replace('O','0','g')
						;
				},
				pattern: "[01]{0,6}",
				oninput: function(ev) {
					vn.state.value2 = ev.target.value;
					vn.state.value2error = ev.target.validationMessage;
				},
			},
			{
				id: 'filledinitially',
				label: _('With initial value'),
				outlined: true,
				value: vn.state.value3,
				oninput: function(ev) {
					vn.state.value3 = ev.target.value;
				},
				help: _("Test with initial valued input"),
			},
		].map(function(v) {
			return m(Layout.Cell, {span:4}, m(TextField, v));
		}),
		[
			m(Layout.Cell, m('',"value1: ", this.value1),
			this.value1error? m('b.red'," error: ", this.value1error):''),
			m(Layout.Cell, m('',"value2: ", this.value2),
			this.value2error? m('b.red'," error: ", this.value2error):''),
		]),
		m(Layout.Row, [
			m(Layout.Cell, m('h3',"Textfield styles")),
		]),
		['boxed','outlined'].map(function(type) {
		return m(Layout.Row, [
			{
				id: 'mytextfield',
				label: _('My label'),
			},
			{
				id: 'icon',
				label: _('With icon'),
				faicon: 'asterisk',
			},
			{
				id: 'coloricon',
				label: _('With color icon'),
				faicon: 'asterisk.red',
			},
			{
				id: 'leadicon',
				label: _('With leading icon'),
				leadingicon: 'phone',
			},
			{
				id: 'bothicons',
				label: _('With leading and trailing icon'),
				leadingicon: 'phone',
				trailingicon: 'warning',
			},
			{
				id: 'helpfull',
				label: _('With helper text'),
				help: _('This is a helper text'),
			},
			{
				id: 'programatic',
				label: _('Programatic content'),
				help: _('Remove the value programmatically'),
				value: TextField.Example.text,
				oninput: function(ev) {
					TextField.Example.text=ev.target.value;
				},
				trailingicon: TextField.Example.text?'delete':'edit',
				iconaction: function() {
					TextField.Example.text=TextField.Example.text?'':_('Added content');
				},
			},
			{
				id: 'affixes',
				label: _('With prefix and suffix'),
				prefix: '$',
				suffix: '.00',
			},
		].map(function(v) {
			var attrs = Object.assign({}, v);
			if (type) {
				attrs[type] = true;
				attrs.id += type;
				attrs.label += " "+type
			}
			return m(Layout.Cell, {span:4}, m(TextField, attrs));
		})
		);
	}),
	);
};


module.exports = TextField

// vim: noet ts=4 sw=4
