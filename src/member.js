'use strict';
var m = require('mithril');
var _ = require('./translate');
var Layout = require('./mdc/layout');
var Row = Layout.Row;
var Cell = Layout.Cell;
var Chooser = require('./chooser');

/** @module */

/**
@namespace Member

*/

var Member = {
	oninit: function(vn) {
        vn.state.model = vn.attrs.model || {};

        vn.state.model.error = undefined;

        vn.state.model.validate = function() {
            vn.state.model.error=undefined;
            function error(message) {
                vn.state.model.error = message;
                return message;
            }
            if(vn.state.model.become_member === undefined ){
                return error(_('BECOME_MEMBER_UNSELECTED'));
            }
            return vn.state.model.error;
        };
    },
	view: function(vn) {
		return	m(Row, [
            m(Cell, {span:12}, m.trust(_('BECOME_MEMBER_PRESENTATION'))),
            m(Cell, {span:12},
                m(Chooser, {
                    id: 'become_member',
                    question: _('BECOME_MEMBER_QUESTION'),
                    required: true,
                    value: vn.state.model.become_member,
                    onvaluechanged: function(newvalue){
                        vn.state.model.become_member = newvalue;
                    },
                    options: [{
                        value: true,
                        label: _('BECOME_MEMBER_YES_LABEL'),
                        description: m.trust(_('BECOME_MEMBER_YES_DESCRIPTION')),
                    },{
                        value: false,
                        label: _('BECOME_MEMBER_NO_LABEL'),
                        description: m.trust(_('BECOME_MEMBER_NO_DESCRIPTION')),
                    }],
                })
            ),
            m(Cell, {span:12}, m.trust(_('BECOME_MEMBER_NOTE'))),
        ]);
    }
}

module.exports=Member
// vim: noet ts=4 sw=4