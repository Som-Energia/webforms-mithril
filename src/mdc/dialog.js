'use strict';
var m = require('mithril');
require('@material/dialog/dist/mdc.dialog.css');

const mdcDialog = require('@material/dialog');
const MDCDialog = mdcDialog.MDCDialog;
const MDCDialogFoundation = mdcDialog.MDCDialogFoundation;
const util = mdcDialog.util;

/**
# Attributes

- header: (node) to show within the header
- scrollable: (bool) enables the scroll on the dialog content
- backdrop: (bool) darkens the background, and closes on out clicks

# Button attributes

- text: Button text
- action: (bool) mark the button as special action (secondary style)
- cancel: (bool) mark the button as cancel button (closes and rejects)
- accept: (bool) mark the button as accept button (closes accepting)
*/

var Dialog = {};
Dialog.oninit = function(vn) {
	vn.state.model = vn.attrs.model || {};
	vn.state.model.open = function() {
		vn.state.widget.show();
	};
};
Dialog.oncreate = function(vn) {
	vn.state.widget = MDCDialog.attachTo(vn.dom);
	vn.state.widget.listen('MDCDialog:accept', function() {
		vn.attrs.onaccept && vn.attrs.onaccept();
	});
	vn.state.widget.listen('MDCDialog:cancel', function() {
		vn.attrs.oncancel && vn.attrs.oncancel();
	});
};
Dialog.view = function(vn) {
    var id = vn.attrs.id;
    return m('aside.mdc-dialog[role=alertdialog]', {
        id: id,
        'aria-labelledby': id+'-label',
        'aria-describedby': id+'-description',
        },[
        m('.mdc-dialog__surface', [
            m('header.mdc-dialog__header',
                m('h2.mdc-dialog__header__title', {
                    id: id+'-label',
                }, vn.attrs.header)
            ),
            m('section.mdc-dialog__body'+
				(vn.attrs.scrollable?'.mdc-dialog__body--scrollable':'')+
				'', {
                id: id+'-description'
            },[
                vn.children
            ]),
            m('footer.mdc-dialog__footer',
                vn.attrs.buttons.map(function (button) {
                    return m('button[type="button"]'+
                        '.mdc-button'+
                        '.mdc-dialog__footer__button'+
                        (button.cancel?'.mdc-dialog__footer__button--cancel':'')+
                        (button.accept?'.mdc-dialog__footer__button--accept':'')+
                        (button.action?'.mdc-dialog__action':'')+
                        '', button, button.text);
                })
            ), 
        ]),
        (vn.attrs.backdrop?m('.mdc-dialog__backdrop'):''),
    ]);
};

Dialog.Example = {};
Dialog.Example.dialog = {
	backdrop: true,
	scrollable: false,
};
Dialog.Example.dialog2 = {};
Dialog.Example.view = function(vn) {
	var self = this;
	var Layout = require('./layout');
	var Checkbox = require('./checkbox');
	var Button = require('./button');
	console.log("Example view:", Dialog.Example.dialog);
	return m(Layout,
		m(Layout.Row, m(Layout.Cell, m('h2', 'Dialogs'))),
		m(Layout.Row, {align: 'center'}, [
			m(Layout.Cell, {span:3}, m(Button, {
				onclick: function(ev) {
					console.log(self);
					self.dialog.open();
				},
			}, 'Show dialog')),
			m(Layout.Cell, {span:3}, m(Checkbox, {
				id: 'enable-backdrop',
				label: 'Backdrop',
				checked: self.dialog.backdrop,
				onchange: function(ev) {
					self.dialog.backdrop = ev.target.checked;
				},
			})),
			m(Layout.Cell, {span:3}, m(Checkbox, {
				id: 'enable-scroll',
				label: 'Scrollable',
				checked: self.dialog.scrollable,
				onchange: function(ev) {
					self.dialog.scrollable = ev.target.checked;
				},
			})),

		]),
		m(Layout.Row, m(Layout.Cell, {span:12},
			m('pre', JSON.stringify(this.dialog, null, 2))
		)),
		m(Dialog, {
			id: 'dialog-example',
			header: "Tittle of the example dialog",
			model: self.dialog,
			buttons: [{
				text: 'Doit',
				action: true,
				onclick: function () {
					console.log("Modal action executed!");
					self.dialog2.open();
				},
			},{
				text: 'Reject',
				cancel: true,
			},{
				text: 'Accept',
				accept: true,
			}],
			onaccept: function() {
				console.log("Accepted!!");
			},
			oncancel: function() {
				console.log("Rejected!!");
			},
			backdrop: self.dialog.backdrop,
			scrollable: self.dialog.scrollable,
		},[
			m('', {style: { height: '30em' }}, "Content"),
		]),
		m(Dialog, {
			id: 'innerdialog',
			header: "Inner dialog",
			model: self.dialog2,
			buttons: [{
				text: 'Doit',
				action: true,
				onclick: function () {
					console.log("Inner Modal action executed!");
				},
			},{
				text: 'Reject',
				cancel: true,
			},{
				text: 'Accept',
				accept: true,
			}],
			onaccept: function() {
				console.log("Inner Accepted!!");
			},
			oncancel: function() {
				console.log("Inner Rejected!!");
			},
			backdrop: false,
			scrollable: false,
		},[
			"Inner Content"
		])
	);
};


module.exports = Dialog;


// vim: noet ts=4 sw=4
