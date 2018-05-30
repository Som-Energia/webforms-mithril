'use strict';
var m = require('mithril');
var css = require('./style.styl');
var mdc = require('material-components-web');
var _ = function(t) { return t; } // Mockup for translation
require('@material/button/dist/mdc.button.css');
require('@material/textfield');
require('@material/textfield/dist/mdc.textfield.css');
require('@material/ripple');
require('@material/ripple/dist/mdc.ripple.css');
require('@material/floating-label');
require('@material/floating-label/dist/mdc.floating-label.css');
require('font-awesome/css/font-awesome.css');

m.prop = require('mithril/stream');


var ValidatedField = {
	oncreate: function(dom) {
	},
	view: function (vnode) {
		var attrs = Object.assign({}, vnode.attrs);
		attrs.help_id = attrs.id+'_help';
		attrs.error_id = attrs.id+'_error';
		return m('.mdc-form-field', [
			m('.mdc-text-field'+
				'', {
					'data-mdc-auto-init': 'MDCTextField',
				},[
				m('input[type=text]'+
					'.mdc-text-field__input'+
					(attrs.icon?'.mdc-text-field--with-trailing-icon':'')+
					'',
				{
					id: attrs.id,
					value: attrs.value,
					disabled: attrs.disabled,
					required: attrs.required,
					isvalid: attrs.error?false:true,
					oninput: function(ev) {
						console.debug('oninput',ev);
						vnode.attrs.value=ev.target.value;
						console.debug('oninput end',vnode.attrs);
					},
					'aria-controls': attrs.help_id,
					'aria-describedby': attrs.help_id,
				}),

				m('label.mdc-floating-label',
					{'for': vnode.attrs.id}, [
					vnode.attrs.label,
				]),
				attrs.icon?
					m('.mdc-text-field__icon', {
						//tabindex: 0,
						//role: 'button',
						}, [
							m('i.fa'+attrs.icon,''),
						]):[],
				attrs.icon?
					m('.mdc-text-field__icon', {
						//tabindex: 0,
						//role: 'button',
						}, [
							m('i.fa'+attrs.icon,''),
						]):[],
				m('.mdc-line-ripple'),
			]),
			attrs.help?
				m('.mdc-text-field-helper-text', {
					id: attrs.help_id,
					'aria-hidden': true,
					},
					attrs.help
				):'',
			attrs.error?
				m('.mdc-text-field-helper-text'+
					'.mdc-text-field-helper-text--validation-msg'+
					'', {
					id: attrs.error_id,
					'aria-hidden': true,
					},
					attrs.error
				):'',
		]);
	},
};

var form = {
	oncreate: function(vnode) {
		console.debug('auto init', vnode);
		mdc.autoInit();
	},
	view: function() {
		return m('.form', {
		}, 
		[
			m(ValidatedField, {
				id: 'fieldid',
				label: _('Field label'),
				help: _('Field Help'),
				icon: '.fa-spinner.fa-spin',
			}),
			m(ValidatedField, {
				id: 'nif',
				label: _('NIF/DNI'),
				error: _('Bad NIF'),
				validator: function (value) {
					m.request({
						method: 'GET',
						url: 'https://webforms.somenergia.coop/api'
					})
					return false;
				},
			}),
			m(ValidatedField, {
				id: 'name',
				label: _('Name'),
				required: true,
				help: _('Ayuda'),
				error: _('Fatal'),
			}),
			m('.mdc-button', {tabindex:0,role:'button'},  _("hello")),
		]);
	},
};


window.onload = function() {
	var element = document.getElementById("mithril-target");
	m.mount(element, form);
};
// vim: noet ts=4 sw=4
