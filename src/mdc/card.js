'use strict';
var m = require('mithril');
require('@material/card/dist/mdc.card.css');
require('@material/icon-button/dist/mdc.icon-button.css');
require('@material/icon-button');
require('material-design-icons/iconfont/material-icons.css');

/**
# Attributes

- `outlined`: instead of casting a shadow, draw an outline
- `fullbleed`: expans the only button in the action area to the whole width

# Button Action attributes

# Icon Action attributes

# Card.Media

Card media is an image covered portion of the Card content
which may contain itself content.

## Card.Media attributes
- `image`: the image to show as background
- `square`: set the height equal to the width on the media area
- `wide`: set the media area height to 16-9 proportion (default

*/

var Card = {};
Card.view = function(vn) {
	return m('.mdc-card'
		+(vn.attrs.outlined?'.mdc-card--outlined':'')
		, vn.attrs, [
		(vn.attrs.onprimary ?
			m('a.mdc-card__primary-action',
				{onclick: vn.attrs.onprimary },
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
						, {
							title: icon.title,
							//'data-mdc-ripple-is-unbounded': "",
						}, icon.micon
					);
				}),
			]),
		]),
	]);
};

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
