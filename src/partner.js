'use strict';
var m = require('mithril');
var _ = require('./translate');
var Layout = require('./mdc/layout');
var Row = Layout.Row;
var Cell = Layout.Cell;
var Chooser = require('./chooser');

/** @module */

/**
@namespace Partner

*/

var Partner = {
	oninit: function(vn) {
        vn.state.model = vn.attrs.model || {};

        vn.state.model.error = undefined;

        vn.state.model.validate = function() {
            vn.state.model.error=undefined;
            function error(message) {
                vn.state.model.error = message;
                return message;
            }
            if(vn.state.model.partner_join === undefined ){
                return error(_('PARTNER_JOIN_UNSELECTED'));
            }
            if(vn.state.model.partner_join === false){
                return error(false);
            }                
            return vn.state.model.error;
        };
    },
	view: function(vn) {
		return	m(Row, [
            m(Cell, {span:12}, m.trust(_('PARTNER_JOIN_PRESENTATION'))),
            m(Cell, {span:12},
                m(Chooser, {
                    id: 'partner_join',
                    question: _('PARTNER_JOIN_QUESTION'),
                    required: true,
                    value: vn.state.model.partner_join,
                    onvaluechanged: function(newvalue){
                        vn.state.model.partner_join = newvalue;
                    },
                    options: [{
                        value: 'yes',
                        label: _('PARTNER_JOIN_YES_LABEL'),
                        description: _('PARTNER_JOIN_YES_DESCRIPTION'),
                    },{
                        value: 'no',
                        label: _('PARTNER_JOIN_NO_LABEL'),
                        description: _('PARTNER_JOIN_NO_DESCRIPTION'),
                    }],
                })
            ),
            m(Cell, {span:12}, m.trust(_('PARTNER_JOIN_NOTE'))),
        ]);
    }
}    

module.exports=Partner
// vim: noet ts=4 sw=4