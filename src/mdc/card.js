'use strict';
/** @module */
var m = require('mithril');
require('@material/card/dist/mdc.card.css');
require('@material/icon-button/dist/mdc.icon-button.css');
require('@material/ripple/dist/mdc.ripple.css');
require('@material/icon-button');
require('@material/ripple/dist//mdc.ripple.css');
require('material-design-icons/iconfont/material-icons.css');
var MDCRipple = require('@material/ripple').MDCRipple;

/**
@namespace Card
@description Displays a packed bit of information you can interact with.

![](../docs/shots/mdc-card.png)

@property {bool} outlined  Shows the card in the outlined style instead of casting a shadow
@property {bool} fullbleed TODO: expans the only button in the action area to the whole width

@property {function} onprimary  Callback to be called if you click on the main body
@property {Object[]} buttons  Array of object with the attributes for the buttons
@property {string} buttons.text  Array of object with the attributes for the buttons
@property {} buttons.* Any other parameter is passed as is to the button
@property {Object[]} icons  Array of object with the attributes for the icon buttons
@property {string} icons.micon  Material icon name
@property {string} icons.title  Text to be shown on hover for the icon button
@property {} icons.* Any other parameter is passed as is to the icon button
*/

var Card = {};
Card.oncreate = function(vn) {
	var primary = vn.dom.querySelector('.mdc-card__primary-action')
	primary && MDCRipple.attachTo(primary);
};
Card.view = function(vn) {
	return m('.mdc-card'
		+(vn.attrs.outlined?'.mdc-card--outlined':'')
		, vn.attrs, [
		(vn.attrs.onprimary ?
			m('a.mdc-card__primary-action',
				{onclick: vn.attrs.onprimary},
				vn.children
			) : vn.children),
		(vn.attrs.buttons||vn.attrs.icons) && m('.mdc-card__actions', [
			m('.mdc-card__action-buttons', [
				vn.attrs.buttons && vn.attrs.buttons.map(function(button) {
					return m('button'
						+'.mdc-button'
						+'.mdc-card__action'
						+'.mdc-card__action--button'
						, button, button.text);
			
				})
			]),
			m('.mdc-card__action-icons', [
				vn.attrs.icons && vn.attrs.icons.map(function(icon) {
					return m(''
						+'.mdc-icon-button'
						+'.material-icons'
						+'.mdc-card__action'
						+'.mdc-card__action--icon'
						, Object.assign(icon, {
							// 'data-mdc-ripple-is-unbounded': "",
						}),  icon.micon
					);
				}),
			]),
		]),
	]);
};
Card.oncreate = function(vn) {
	
};

/**
@namespace Media
@memberof! module:mdc/card.Card
@description Card media is an image covered portion of the Card content
which may contain itself content.

@property {string} image  - The image to show as background
@property {bool} square - Set the height equal to the width on the media area
@property {bool} wide - Set the media area height to 16-9 proportion
@property {vnode[]} _children_ - Content
*/
Card.Media = {};
Card.Media.view = function(vn) {
	return m('.mdc-card__media'
		+(vn.attrs.square?'.mdc-card__media--square':'')
		+(vn.attrs.wide?  '.mdc-card__media--16-9':'')
		, Object.assign({
			style: {
				'background-image': vn.attrs.image,
			},
		}, vn.attrs), [
		m('a.mdc-card__media-content', vn.children)
	]);
};


Card.Example = {};
Card.Example.card = {
};
Card.Example.view = function(vn) {
	var self = this;
	var Layout = require('./layout');
	return m(Layout,
		m(Layout.Row, m(Layout.Cell, m('h2', 'Cards'))),
		m(Layout.Row, {align: 'center'}, [
			m(Layout.Cell, {span: 6}, [
				m(Card, {
					buttons: [{
						text: 'Action 1',
						onclick: function(ev) { alert('Action 1'); },
					},{
						text: 'Action 2',
					}],
					icons: [{
						micon: 'share',
						title: 'Share'
					},{
						micon: 'more_vert',
						title: 'More options',
					}],
				}, m(Card.Media, {
					image: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%,rgba(50,155,0,0.5) 100%)'
						+',url("https://www.somenergia.coop/wp-content/uploads/2016/12/cuca.png")',
					wide: true,
					}, m('.mdc-theme--secondary', [
						m('.mdc-typography--overline', 'Overline'),
						m('.mdc-typography--headline5', 'Titulo'),
					]))
				),
				m('p'),
				m(Card, {
						onprimary: function() {alert('Primary Action');},
						outlined: true,
					},
					m(Card.Media, {
					image: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%,rgba(50,155,0,0.5) 100%)'
						+',url("https://www.somenergia.coop/wp-content/uploads/2016/12/cuca.png")',
					wide: true,
					}, m('.mdc-theme--secondary', [
						m('.mdc-typography--overline', 'Overline'),
						m('.mdc-typography--headline5', 'Titulo'),
					]))
				),
			]),
			m(Layout.Cell, {span: 6}, m(Card, {
				onprimary: function() {alert('Primary Action');},
				buttons: [{
					text: 'Action 1',
					onclick: function(ev) { alert('Action 1'); },
				},{
					text: 'Action 2',
				}],
				icons: [{
					micon: 'share',
					title: 'Share'
				},{
					micon: 'more_vert',
					title: 'More options',
				}],
			}, 
				// If you want the titles to outstand outside the media
				m('.mdc-typography--overline', 'Overline'),
				m('.mdc-typography--headline5', 'Titulo'),
				m(Card.Media, {
					square: true,
					image: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%,rgba(0,20,0,0.5) 100%)'+
						',url("http://malarrassa.cat/wp-content/uploads/2016/04/somenergia-25000.jpg")',
					}, [
					])
			)),
		]),
	);
};


module.exports = Card;


// vim: noet ts=4 sw=4
