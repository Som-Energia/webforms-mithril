'use strict';
var m = require('mithril');
var moment = require('moment');
var _ = require('./translate');
var css = require('./style.styl');
var Layout = require('./mdc/layout');
var Button = require('./mdc/button');
var Select = require('./mdc/select');
var jsyaml = require('js-yaml');
var DatePicker = require('./datepicker');

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
        console.log("Resultat:",response)
        sending=false;
        result=response;
    });
    promise.catch(function(error){
        console.log("Error:",error)
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
				'Warning: Numbers are not fully real. '+
				'Members are located at its current home regardless it was somewhere else in the past. '+
				'Old members are not counted when they were active at the time they were. '
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

			m('', {style: 'text-align: center'},
				m('', m('tt', uri())),
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
			m('th', {colspan: levels.length+3}, _('Name')),
			data.dates.map(function(date, i) {
				return m('th', moment(date).format('YYYY-MM-DD'));

			})
		),
		subresultTable(data,0)
	);
}


function subresultTable(subresult, level) {
	if (subresult===undefined) return [];
	var children = levels[level] && subresult[levels[level]];
	var name = subresult.name || _('Global');
	var indent = levels.length - level + 1;
	return [
		m('tr', [
			m('td', {colspan: level+1}),
			m('td', children?m('span.fa.fa-icon.fa-plus'):''),
			m('td', {colspan: indent}, name),
			subresult.values.map(function(value, i) {
				return m('td', {style: 'text-align: right'}, value);
			}),
		]),
		children!==undefined &&
		Object.keys(children).map(function(code, i) {
			return subresultTable(children[code], level+1);
		}),
	];
}


window.onload = function() {
    var element = document.getElementById("mithril-target");
    m.mount(element, OpenData);
    //traceFocus();
};

// vim: noet ts=4 sw=4
