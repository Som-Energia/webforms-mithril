'use strict';
var m = require('mithril');
require('@material/dialog/dist/mdc.dialog.css');

const mdcDialog = require('@material/dialog');
const MDCDialog = mdcDialog.MDCDialog;

/** @module */

/**
@namespace Dialog
@description A Material Design Modal Dialog wrapped as Mithril component.

A modal dialog is used to require the user total atention on a piece
of information or decision that has to be taken.

Material Design guidelines recommend whenever is possible to use other components like
Banners and Snack Bars which are non blocking and less disturbing to the user.

Actions are activated

![](../docs/shots/mdc-dialog.png)

@property {vnode} header - Content of the header
@property {bool} backdrop - If true darkens the background, and cancels clicking outside
@property {object} model - An empty object to be filled with the public API methods.
@property {function} model.open() -  Opens the dialog
@property {function} model.close(action) - Closes the dialog with the given action
@property {function} onX - Function to be called, after closing the dialog because of action X
@property {function} onaction - Function to be called, after closing the dialog because of an action without a onX handler
@property {function} onbeforeX - Function to be called, before closing the dialog because of action X
@property {function} onbeforeaction - Function to be called, before closing the dialog because of an action without an onbeforeX handler
@property {Object[]} buttons - Array of objects representing the dialog buttons.
@property {string} buttons.text - Button text
@property {string} buttons.action - Action to activate on close
@property {string} buttons.default - Define the button as the one to click when return is pressed
@property {bool} buttons.* - any other attribute will be passed to the underlying button, notably `onclick`
@property {vnode[]} _children_ - Main content of the dialog

@example
const Dialog = require('./mdc/dialog');
var mydialog = {};
...
m(Dialog, {
    onclose: function() { }, // Whatever to do on close action
    onaccept: function() { }, // Whatever to do on accept action
    model: mydialog, // inject object
    header: _("Warning"),
    buttons: [
        { text: _("Help"), onclick: showhelp }, // Custom action
        { text: _("No"), action: 'close' }, // Default cancel action
        { text: _("Yes"), action: 'accept' }, // Default accept action
    ],
}, m('',_('We are really doing it. Proceed?'))),

m(Button, {
    // open is accessible via mydialog
    onclick: function() { mydialog.open(); },
}, _("Open Dialog")),
*/

var Dialog = {};
Dialog.oninit = function(vn) {
	vn.state.model = vn.attrs.model || {};
	vn.state.model.open = function() {
		vn.state.widget.open();
	};
	vn.state.model.close = function(action) {
		vn.state.widget.close(action);
	};
};
Dialog.oncreate = function(vn) {
	vn.state.widget = new MDCDialog(vn.dom);
	vn.state.widget.listen('MDCDialog:closed', function(ev) {
		var action = vn.attrs['on'+ev.detail.action];
		action ? action(ev) :
			vn.attrs.onaction && vn.atts.onaction(ev);
	});
	vn.state.widget.listen('MDCDialog:closing', function(ev) {
		var action = vn.attrs['onbefore'+ev.detail.action];
		action ? action(ev) :
			vn.attrs.onaction && vn.atts.onbeforeaction(ev);
	});
};
Dialog.onremove = function(vn) {
	vn.state.widget.destroy();
};
Dialog.view = function(vn) {
    var id = vn.attrs.id;
    return m('div.mdc-dialog[role=alertdialog]', {
        id: id,
        'aria-modal': 'true',
        'aria-labelledby': id+'-label',
        'aria-describedby': id+'-description',
        },[
        m('.mdc-dialog__container', [
			m('.mdc-dialog__surface', [
				m('h2.mdc-dialog__title', {
					id: id+'-label',
				}, vn.attrs.header),
				m('.mdc-dialog__content', {
					id: id+'-description'
				},[
					vn.children
				]),
				vn.attrs.buttons &&
				m('footer.mdc-dialog__actions',
					vn.attrs.buttons.map(function (button) {
						var attrs = Object.assign({},button,{
							'data-mdc-dialog-action': button.action,
							});
						return m('button[type="button"]'+
							'.mdc-button'+
							'.mdc-dialog__button'+
							(attrs['default']?'.mdc-dialog__button--default':'')+
							'', attrs, button.text);
					})
				),
			]),
        ]),
        (vn.attrs.backdrop?m('.mdc-dialog__scrim'):''),
    ]);
};

Dialog.Example = {};
Dialog.Example.dialog = {
	backdrop: true,
	outer: {},
	inner: {},
};
Dialog.Example.view = function(vn) {
	var self = this;
	var Layout = require('./layout');
	var Checkbox = require('./checkbox');
	var Button = require('./button');
	return m(Layout,
		m(Layout.Row, m(Layout.Cell, m('h2', 'Dialogs'))),
		m(Layout.Row, {align: 'center'}, [
			m(Layout.Cell, {span:3}, m(Checkbox, {
				id: 'enable-backdrop',
				label: 'Backdrop',
				checked: self.dialog.backdrop,
				onchange: function(ev) {
					self.dialog.backdrop = ev.target.checked;
				},
			})),
			m(Layout.Cell, {span:3}, m(Button, {
				onclick: function(ev) {
					self.dialog.outer.open();
				},
			}, 'Show dialog')),
		]),
		m(Layout.Row, m(Layout.Cell, {span:12},
			m('pre', JSON.stringify(this.dialog, null, 2))
		)),
		m(Dialog, {
			id: 'dialog-example',
			header: "Tittle of the example dialog",
			model: self.dialog.outer,
			buttons: [{
				text: 'Sub dialog',
				onclick: function() {
					self.dialog.inner.open();
				},
			},{
				text: 'Reject',
				action: 'close',
			},{
				text: 'Accept',
				action: 'accept',
				'default': true,
			}],
			onaccept: function() {
				self.dialog.outerexit = 'Accepted';
				m.redraw();
			},
			onclose: function() {
				self.dialog.outerexit = 'Rejected';
				m.redraw();
			},
			backdrop: self.dialog.backdrop,
		},[
			m('', {style: { width: '100em', height: '200em' }}, "Content"),
		]),
		m(Dialog, {
			id: 'innerdialog',
			header: "Inner dialog",
			model: self.dialog.inner,
			buttons: [{
				text: 'Doit',
				action: true,
				onclick: function () {
					console.log("Inner Modal action executed!");
				},
			},{
				text: 'Third close',
				action: 'reclose',
			},{
				text: 'Reject',
				action: 'close',
			},{
				text: 'Accept',
				action: 'accept',
				'default': true,
			}],
			onbeforeaction: function(ev) {
			},
			onaccept: function(ev) {
				ev.cancelBubble = true;
				self.dialog.innerexit = 'Accepted';
				m.redraw();
			},
			onclose: function(ev) {
				self.dialog.innerexit = 'Rejected';
				m.redraw();
			},
			backdrop: false,
		},[
			"Inner Content"
		])
	);
};


module.exports = Dialog;


// vim: noet ts=4 sw=4
