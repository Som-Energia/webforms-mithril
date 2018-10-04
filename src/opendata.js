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

require('font-awesome/css/font-awesome.css');
require('@material/typography/dist/mdc.typography.css').default;

var uribase = 'http://0.0.0.0:5001/v0.2';
var uribase = 'https://opendata.somenergia.coop/v0.2';

var sending = false;
var result = undefined;
var apierror = undefined;
var metric = 'members';
var time = 'on';
var geolevel = '';
var fromdate = undefined;
var todate = undefined;
var ondate = undefined;
var viewmode= 'table';
var filters=undefined;

function uri() {
    var result = uribase+'/'+metric;
	result += geolevel?'/by/'+geolevel:'';

    var geolevelPart = geolevel?"/by/"+geolevel:"";
	var timePart = '';
	var fromPart = '';
	var toPart = '';
	var onPart = '';
	if (time==='on') {
		result+= ondate && '/on/'+ondate.format('YYYY-MM-DD') || '';
	}
	else {
		result+= '/'+time;
		result+= fromdate && '/from/'+fromdate.format('YYYY-MM-DD') || '';
		result+= todate   && '/to/'  +  todate.format('YYYY-MM-DD') || '';
	}
	if (filters) {
		result+= '?'+filters;
	}
    return result;
}

function doRequest() {
    sending=true;
    result=undefined;
    apierror=undefined;
    var promise = m.request({
        method: 'GET',
        deserialize: jsyaml.load,
        url: uri(),
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
			m('h1', 'Som Energia - Open Data API - UI'),
			m('', _(
				'Warning: Numbers are not fully real yet. '+
				'People is considered to have lived at its current home for ever, even when this was not the case in the past. '+
				'Former members are not counted as active at the time they were. '+
				'Also the source data needs a clean up.'
				)),
            m(Select, {
                id: 'metric',
                label: _('Metric'),
                help: _('Select the metric to query'),
                required: true,
                value: metric,
                onchange: function(ev) {metric=ev.target.value;},
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
                label: _('Geographical level'),
                help: _('Dig down to a geographical level of detail'),
                value: geolevel,
                onchange: function(ev) {geolevel=ev.target.value;},
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
                label: _('Time line'),
                help: _('Time points when the metrics are measured'),
                required: true,
                value: time,
                onchange: function(ev) {time=ev.target.value;},
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
				time==='on' && m(Layout.Cell, {span:6, spantablet:8}, m(DatePicker, {
					id: 'ondate',
					label: _('On'),
					required: true,
					help: _(
						'Date at which look for. '+
						'Default: last available.'),
					value: ondate,
					onchange: function(newvalue) {
						ondate=newvalue;
					},
					boxed: true,
					autoclose: true,
				})),

				time !== 'on' && m(Layout.Cell, {span:6, spantablet:8}, m(DatePicker, {
						id: 'fromdate',
						label: _('From'),
						help: _(
							'First day that will be included. '+
							'Default: oldest available.'),
						value: fromdate,
						onchange: function(newvalue) {
							fromdate=newvalue;
						},
						boxed: true,
						autoclose: true,
					})),

				time !== 'on' && m(Layout.Cell, {span:6, spantablet:8}, m(DatePicker, {
					id: 'todate',
					label: _('To'),
					help: _(
						'Last day that will be included. '+
						'Default: last available'),
					value: todate,
					onchange: function(newvalue) {
						todate=newvalue;
					},
					boxed: true,
					autoclose: true,
				})),
			]),
			m(TextField, {
				id: 'filters',
				label: _('Filters'),
				leadingfaicon: 'filter',
				faicon: filters && 'times-circle',
				help: _('An ampersand (&) separated sequence of level=value, '+
					'where level is one of "country", "ccaa", "state", "city" '+
					'and value is the INE code'),
				value: filters,
				iconaction: filters && function() {
					filters='';
				},
				oninput: function(ev) {
					filters=ev.target.value;
				},
			}),
			m('', {style: 'text-align: center'},
				m('', {style: {
					padding: '12pt',
					background: 'rgba(0,0,0,0.1)',
					margin: '16pt 0pt',
				}}, m('tt', uri())),
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
				m('h2', 'Result'),
				m(Select, {
					id: 'view',
					label: _('View Mode'),
					help: _('How do you want to view it'),
					required: true,
					value: viewmode,
					onchange: function(ev) {viewmode=ev.target.value;},
					options: [{
						text: _('Table'),
						value: 'table',
					},{
						text: _('YAML (original)'),
						value: 'yaml',
					},{
						text: _('JSON'),
						value: 'json',
					}],
				}),
				viewmode==='table' && resultTable(result),
				viewmode==='yaml' && m('pre', jsyaml.dump(result)),
				viewmode==='json' && m('pre', JSON.stringify(result,null,2)),
			],
            apierror && m('pre.red', "Error: ", apierror.message),
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
