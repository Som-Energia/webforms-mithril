'use strict';
var m = require('mithril');
var moment = require('moment');
var _ = require('./translate');
var css = require('./style.styl');
var Layout = require('./mdc/layout');
var Button = require('./mdc/button');
var Select = require('./mdc/select');
var TextField = require('./mdc/textfield');
var DatePicker = require('./datepicker');
var jsyaml = require('js-yaml');
var OpenDataUri = require('./opendatauri');

var opendatauri = new OpenDataUri();

require('font-awesome/css/font-awesome.css');
require('@material/typography/dist/mdc.typography.css').default;

var sending = false;
var result = undefined;
var apierror = undefined;
var viewmode= 'table';


function doRequest() {
    sending=true;
    result=undefined;
    apierror=undefined;
    var promise = m.request({
        method: 'GET',
        deserialize: jsyaml.load,
        url: opendatauri.uri(),
        withCredentials: true,
    });
    promise.then(function(response){
        sending=false;
        result=response;
    });
    promise.catch(function(error){
        sending=false;
        apierror=error;
    });
}

var OpenData = {
    view: function(vn) {
		var Layout = require('./mdc/layout');
        return m('.form.mdc-typography', m(Layout,[
			m('h1', _('OPENDATAUI_TITLE')),
			m('.disclaimer', _('ALPHA_DISCLAIMER')),
            m(Select, {
                id: 'metric',
                label: _('METRIC_LABEL'),
                help: _('METRIC_HELP'),
                required: true,
                value: opendatauri._metric,
                onchange: function(ev) {opendatauri._metric=ev.target.value;},
                options: [{
                    text: _('Members'),
                    value: 'members',
                },{
                    text: _('Contracts'),
                    value: 'contracts',
                }],
            }),
            m(Select, {
                id: 'geolevel',
                label: _('GEOLEVEL_LABEL'),
                help: _('GEOLEVEL_HELP'),
                value: opendatauri._geolevel,
                onchange: function(ev) {opendatauri._geolevel=ev.target.value;},
                options: [{
                    text: _('Country'),
                    value: 'country',
                },{
                    text: _('Region'),
                    value: 'ccaa',
                },{
                    text: _('State'),
                    value: 'state',
                },{
                    text: _('City'),
                    value: 'city',
                }],
            }),
            m(Select, {
                id: 'time',
                label: _('TIME_LABEL'),
                help: _('TIME_DESCRIPTION'),
                required: true,
                value: opendatauri._time,
                onchange: function(ev) {opendatauri._time=ev.target.value;},
                options: [{
                    text: _('Single date'),
                    value: 'on',
                },{
                    text: _('Yearly'),
                    value: 'yearly',
                },{
                    text: _('Monthly'),
                    value: 'monthly',
                },{
                    text: _('Weekly'),
                    value: 'weekly',
                }],
            }),
			m(Layout.Row, [
				opendatauri._time==='on' && m(Layout.Cell, {span:12}, m(DatePicker, {
					id: 'ondate',
					label: _('ON_LABEL'),
					help: _('ON_DESCRIPTION'),
					value: opendatauri._ondate,
					onchange: function(newvalue) {
						opendatauri._ondate=newvalue;
					},
					boxed: true,
					autoclose: true,
				})),

				opendatauri._time !== 'on' && m(Layout.Cell, {span:6, spantablet:8}, m(DatePicker, {
						id: 'fromdate',
						label: _('FROM_LABEL'),
						help: _('FROM_DESCRIPTION'),
						value: opendatauri._fromdate,
						onchange: function(newvalue) {
							opendatauri._fromdate=newvalue;
						},
						boxed: true,
						autoclose: true,
					})),

				opendatauri._time !== 'on' && m(Layout.Cell, {span:6, spantablet:8}, m(DatePicker, {
					id: 'todate',
					label: _('TO_LABEL'),
					help: _('TO_DESCRIPTION'),
					value: opendatauri._todate,
					onchange: function(newvalue) {
						opendatauri._todate=newvalue;
					},
					boxed: true,
					autoclose: true,
				})),
			]),
			m(TextField, {
				id: 'filters',
				label: _('FILTERS_LABEL'),
				help: _('FILTERS_DESCRIPTION'),
				leadingfaicon: 'filter',
				faicon: opendatauri._filters && 'times-circle',
				value: opendatauri._filters,
				iconaction: opendatauri._filters && function() {
					opendatauri._filters='';
				},
				oninput: function(ev) {
					opendatauri._filters=ev.target.value;
				},
			}),
			m('', {style: 'text-align: center'},
				m('', {style: {
					padding: '12pt',
					background: 'rgba(0,0,0,0.1)',
					margin: '16pt 0pt',
				}}, m('tt', opendatauri.highlightedUri().map(function(value) {
					switch (value[0]) {
						case 'O': return m('em', value[1]);
						case 'I': return m('b', {style:'color:red'}, value[1]);
						default: return m('span', value[1]);
					}
				}))),
				m(Button, {
					raised: true,
					disabled: sending,
					faicon: sending?"spinner.fa-spin":"paper-plane",
					onclick: function() {
						doRequest();
					},
				}, _('Send')),
			),
			result && [
				m('h2', _('Result')),
				m(Select, {
					id: 'view',
					label: _('VIEWMODE_LABEL'),
					help: _('VIEWMODE_DESCRIPTION'),
					required: true,
					value: viewmode,
					onchange: function(ev) {viewmode=ev.target.value;},
					options: [{
						text: _('VIEWMODE_TABLE'),
						value: 'table',
					},{
						text: _('VIEWMODE_YAML'),
						value: 'yaml',
					},{
						text: _('VIEWMODE_JSON'),
						value: 'json',
					}],
				}),
				viewmode==='table' && resultTable(result),
				viewmode==='yaml' && m('pre', jsyaml.dump(result)),
				viewmode==='json' && m('pre', JSON.stringify(result,null,2)),
			],
            apierror && m('pre.red', "Error: ", apierror.message),
			m('.seedocs', m('a', {href: '/docs', target: '_blank'}, _( 'API Documentation'))),
        ]));
    },
};

var levels = ['countries', 'ccaas', 'states', 'cities']

function resultTable(data) {
	return m('table',
		m('tr',
			m('th', {colspan: levels.length+3},  _('Code')),
			m('th', _('Name')),
			data.dates.map(function(date, i) {
				return m('th', {
					style: 'width: 12ex; text-align:right',
					}, 
					moment(date).format('YYYY-MM-DD'));
			})
		),
		subresultTable(data,0,0)
	);
}


function subresultTable(subresult, level, code, i) {
	if (subresult===undefined) return [];
	var children = levels[level] && subresult[levels[level]];
	var name = subresult.name || _('Global');
	var indent = levels.length - level + 1;
	return [
		m('tr', {style: {'background-color': (i&1?'#eee':'white'), }}, [
			m('td', {colspan: level+1}),
			m('td', m('span.fa.fa-icon.fa-plus')),
			m('td', {colspan: indent}, code),
			m('td', name),
			subresult.values.map(function(value, i) {
				return m('td', {style: 'text-align: right'}, value);
			}),
		]),
		children!==undefined &&
		Object.keys(children).map(function(code, i) {
			return subresultTable(children[code], level+1, code, i);
		}),
	];
}


window.onload = function() {
    var element = document.getElementById("mithril-target");
    m.mount(element, OpenData);
    //traceFocus();
};

// vim: noet ts=4 sw=4
