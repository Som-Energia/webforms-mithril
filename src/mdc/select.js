'use strict';
/** @module */

var m = require('mithril');
var _ = require('../translate');
var MDCSelect = require('@material/select');
require('@material/list/dist/mdc.list.css');
require('@material/menu/dist/mdc.menu.css');
require('@material/menu-surface/dist/mdc.menu-surface.css');
require('@material/select/dist/mdc.select.css');
require('./select.styl');

/**
Mithril component wrapping an MDC Select input field.

Input field that unfolds in a set of options you can choose.
@namespace
@property {string} id  (it won't work if you don't provide one)
@property {string} label  Text to be shown as label of the input
@property {string} help  Helper text to be shown in the bottom of the control
@property {string} icon  Material icon identifier for a trailing icon (Not implemented yet by MDC4W)
@property {string} faicon  Font Awesome icon identifier for a trailing icon (Not implemented yet by MDC4W)
@property {string} leadingicon  Material icon identifier for a leading icon
@property {string} leadingfaicon  Font Awesome icon identifier for a leading icon
@property {function} iconaction  Turns de trailing icon into an action icon executing the function on click (Not implemented yet by MDC4W)
@property {function} leadingiconaction  Turns de leading icon into an action icon executing the function on click
@property {bool} required  Makes the field madatory
@property {bool} disabled  Disables the input
@property {bool} boxed  Activates the boxed style
@property {bool} outlined  Activates the outlined style
@property {bool} nohelp  Does not allocate the space for the helper text when it is empty
@property {string} value  The currently selected value
@property {function} onchange  A callback to be called when the user changes the value
@property {function} oninvalid  A callback to be called when the chosen value is invalid
@property {Object[]} options  A list of objects defining the options
@property {string} options.text  The text to be shown for the option
@property {string} options.value  The value taken by this option
@property {bool} options.disabled  Disables the option to be selected
@property {Object[]} options.group  A list of objects defining suboptions
*/
var Select = {
	oncreate: function(vn) {
		var mdcselect = vn.dom.querySelector('.mdc-select');
		vn.state.native = mdcselect.querySelector('select');
		vn.state.mdcinstance = new MDCSelect.MDCSelect(mdcselect);
		vn.state.mdcinstance.listen('MDCSelect:change', (ev) => {
			console.log(`Selected option at index ${vn.state.mdcinstance.selectedIndex} with value "${vn.state.mdcinstance.value}"`);
			ev.target.value = vn.state.mdcinstance.value;
			vn.attrs.onchange && vn.attrs.onchange(ev);
			m.redraw()
		});
	},
	view: function(vn) {
		function floats() {
			if (vn.attrs.value!==undefined && vn.attrs.value!=="") return true;
			if (!vn.dom) return false;
			if (!vn.state.native) return false;
			if (!vn.state.native===document.activeElement) return true;
			if (!vn.state.native.value) return true;
			return false;
		}
		vn.state.mdcinstance && vn.state.mdcinstance.setValue(vn.attrs.value)
		var attrs = Object.assign({}, vn.attrs);
		function pop(o,k) { var r=o[k]; if (r!==undefined) { delete o[k];} return r; }
		const options = vn.attrs.options || [];
		const floating = floats()
		const boxed = pop(attrs, 'boxed');
		const outlined = pop(attrs, 'outlined');
		const required = attrs.required;
		const disabled = attrs.disabled;
		const label = pop(attrs, 'label');
		const help = pop(attrs, 'help');
		const icon = pop(attrs, 'icon');
		const faicon = pop(attrs, 'faicon');
		const iconaction = pop(attrs, 'iconaction');
		const leadingicon = pop(attrs, 'leadingicon');
		const leadingfaicon = pop(attrs, 'leadingfaicon');
		const leadingiconaction = pop(attrs, 'leadingiconaction');
		const help_id = vn.attrs.id+'_help';
		const label_id = vn.attrs.id+'_label';
		const selectedValue = vn.attrs.value;
		function option(v) {
			if (v.group) {
				return [
					// TODO: Use v.text as separator
					option({...v, disabled: true, group: false}),
					v.group.map( (v,i)=> option(v)),
				]
			}
			return m('li.mdc-list-item'
				+(v.value==selectedValue?'.mdc-list-item--selected':'')
				+(v.disabled?'.mdc-list-item--disabled':'')
				, {
					'aria-selected': v.value==selectedValue?"true":undefined,
					'aria-disabled': v.disabled?"true":undefined,
					'data-value': v.value,
					role: "option",
				},
				m('span.mdc-list-item__ripple'),
				(leadingicon || leadingfaicon) && m('span.mdc-list-item__graphic'),
				v.text && m('span.mdc-list-item__text', v.text)
			)
		}
		return m('', [
			m('.mdc-select'+
				(vn.attrs.disabled?'.mdc-select--disabled':'')+
				(outlined?'.mdc-select--outlined':'')+
				(boxed?'.mdc-select--filled':'')+
				(leadingicon?'.mdc-select--with-leading-icon':'')+
				(leadingfaicon?'.mdc-select--with-leading-icon':'')+
				(icon?'.mdc-select--with-trailing-icon':'')+
				(required?'.mdc-select--required':'')+
				(disabled?'.mdc-select--disabled':'')+
				(label?'':'.mdc-select--no-label')+
				'', {
					style: {width: '100%'},
				}, [
				m('input[type=hidden]', {
					...vn.attrs,
					id: vn.attrs.id,
					required: vn.attrs.required, // TODO: current MDC version does not work yet
					disabled: vn.attrs.disabled,
					'aria-controls': help_id,
					'aria-describedby': help_id,
					value: vn.attrs.value,
					oninvalid: function(ev) {
						vn.attrs.oninvalid && vn.attrs.oninvalid(ev);
					},
				}),
				m('.mdc-select__anchor', {
					role: "button",
					'aria-haspopup': "listbox",
					'aria-expanded': "false",
					'aria-required': required?"true":undefined,
					'aria-disabled': disabled?"true":undefined,
					'aria-labelledby': label_id + " demo-selected-text",
					'aria-controls': help_id,
					'aria-describedby': help_id,
					}, [
						(boxed? [
							m('span.mdc-select__ripple'),
							label && m('span.mdc-floating-label'
								+(vn.attrs.value?'.mdc-floating-label--float-above':'')
								, {
									id: label_id,
								}, label),
						]:''),
						(outlined ? m('span.mdc-notched-outline', [
							m('span.mdc-notched-outline__leading'),
							label && m('span.mdc-notched-outline__notch',
								m('span.mdc-floating-label'
									+(vn.attrs.value?'.mdc-floating-label--float-above':'')
									, label),
							),
							m('span.mdc-notched-outline__trailing'),
						]):''),
						leadingicon &&
							m('i.mdc-select__icon.mdc-select__icon--leading.material-icons',
								leadingiconaction && {
									tabindex: 0,
									role: 'button',
									onclick: leadingiconaction,
								},
								leadingicon),
						leadingfaicon &&
							m('i.mdc-select__icon.mdc-select__icon--leading.fa.fa-'+leadingfaicon,
								leadingiconaction && {
									tabindex: 0,
									role: 'button',
									onclick: leadingiconaction,
								}),
						m('span.mdc-select__selected-text-container',
							m('span.mdc-select__selected-text', {
								id: 'demo-selected-text',
							})
						),
						m('.mdc-select__dropdown-icon',
							m('svg.mdc-select__dropdown-icon-graphic', {
								viewBox: "7 10 10 5",
								focusable: "false",
							}, [
								m('polygon.mdc-select__dropdown-icon-inactive', {
									stroke: "none",
									'fill-rule': "evenodd",
									points: "7 10 12 15 17 10",
								}),
								m('polygon.mdc-select__dropdown-icon-active', {
									stroke: "none",
									'fill-rule': "evenodd",
									points: "7 15 12 10 17 15",
								}),
							])
						),
						(boxed? m('.mdc-line-ripple'):[]),
				]),
				m('.mdc-select__menu.mdc-menu.mdc-menu-surface.mdc-menu-surface--fullwidth', [
					m('ul.mdc-list[role=listbox]', [ // aria-label="Food picker listbox"
						option({value: undefined, text: ''}, vn.state.value), // undefined value
						options.map( (v,i)=> option(v, vn.state.value)),
					]),
				]),
			]),
			m('p.mdc-select-helper-text'+
				//'.mdc-select-helper-text--validation-msg'+
				'', {
				'aria-hidden': true,
				id: help_id,
				},
				help
			),
		]);
	},
};


var Example = {
	Person: {
		field: undefined,
		name: undefined,
		nif: undefined,
		nifValidation: {},
		tastes: 'vegetables',
	},
	view: function(vn) {
		const Layout = require('./layout');
		const options = [
			{
				value: 'grains',
				text: _('Bread, Cereal, Rice, and Pasta'),
			},
			{
				value: 'vegetables',
				text: _('Vegetables'),
			},
			{
				value: 'fruits',
				text: _('Apple'),
			},
			{
				value: 'canibalism',
				text: _('Human Flesh'),
				disabled: true,
			},
		];
		return m(Layout, [
			m(Layout.Row, m(Layout.Cell, {span:12},
				m('h2', 'Selects'))),
			m(Layout.Row,['boxed','outlined'].map(function(style) {
			console.log(Example.Person)
			return m(Layout.Cell,{span:4},
				m(Select, {
					boxed: style!='outlined',
					outlined: style=='outlined',
					id: 'fan'+style,
					label: _('Tastes'),
					help: _('Select what you like more'),
					required: true,
					//disabled: true,
					value: Example.Person.tastes,
					onchange: function(ev) {
						Example.Person.tastes = ev.target.value;
					},
					options: options,
				}));
			}),
			m(Layout.Cell,{span:4},
				m(Select, {
					boxed: true,
					id: 'iconselect',
					label: _('Tastes'),
					help: _('Select what you like more'),
					required: false,
					leadingicon: 'restaurant',
					value: Example.Person.tastes,
					onchange: function(ev) {
						console.log("Changed", ev.target.value)
						Example.Person.tastes = ev.target.value;
					},
					options: options,
				})),
			m(Layout.Cell,{span:4},
				m(Select, {
					outlined: true,
					id: 'selectoutlinedisabled',
					label: _('Tastes'),
					help: _('Select what you like more'),
					required: false,
					leadingfaicon: 'cutlery',
					leadingiconaction: function () {
						console.log("Action");
					},
					value: Example.Person.tastes,
					onchange: function(ev) {
						console.log("Changed", ev.target.value)
						Example.Person.tastes = ev.target.value;
					},
					options: options,
				})),
			m(Layout.Cell,{span:4},
				m(Select, {
					outlined: true,
					id: 'trailingiconselect',
					label: _('Tastes'),
					help: _('Select what you like more'),
					required: false,
					faicon: 'cutlery',
					iconaction: function () {
						console.log("Action");
					},
					value: Example.Person.tastes,
					onchange: function(ev) {
						Example.Person.tastes = ev.target.value;
					},
					options: options,
				}))
			),
			m(Layout.Row, m(Layout.Cell, {span:12},
				_('You are fan of '), Example.Person.tastes )),
		]);
	},
};

Select.Example = Example;

module.exports=Select

// vim: noet ts=4 sw=4
