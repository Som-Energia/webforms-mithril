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

var apierror = undefined;
var time = 'on';
var fromdate = undefined;
var todate = undefined;
var ondate = undefined;
var filters=undefined;

var sending = false;
var viewmode= 'table';

function isodate(date) {
	return date.format('YYYY-MM-DD');
}

var UriComposer = {
	_metric: 'members',
	_geolevel: '',
	metric: function() {
		return this._metric;
	},
	geolevel: function() {
		return this._geolevel;
	},
	setMetric: function(value) {
		this.oldUri = this.uri();
		this._metric = value;
	},
	setGeoLevel: function(value) {
		this.oldUri = this.uri();
		this._geolevel = value;
	},
	animatedUri: function() {
		var currentUri = this.uri();
		for (var i=0; this.oldUri && i<currentUri.length && currentUri[i]===this.oldUri[i]; i++);
		return m('b',
			currentUri.substr(0,i),
			m('span', {"class":"red"}, this.oldUri && currentUri.substr(i)),
			this.oldUri && currentUri.substr(-j+1)
			);
	},
	uri: function() {
		var result = uribase+'/'+this._metric;

		result += this._geolevel?'/by/'+this._geolevel:'';
		if (time==='on') {
			result+= ondate && '/on/'+ isodate(ondate) || '';
		}
		else {
			result+= '/'+time;
			result+= fromdate && '/from/'+ isodate(fromdate) || '';
			result+= todate   && '/to/'  + isodate(todate) || '';
		}
		if (filters) {
			result+= '?'+filters;
		}
		return result;
	},
}

function doRequest() {
    sending=true;
    result=undefined;
    apierror=undefined;
    var promise = m.request({
        method: 'GET',
        deserialize: jsyaml.load,
        url: UriComposer.uri(),
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
                value: UriComposer.metric(),
                onchange: function(ev) {UriComposer.setMetric(ev.target.value);},
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
                value: UriComposer.geolevel(),
                onchange: function(ev) {UriComposer.setGeoLevel(ev.target.value);},
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
				time==='on' && m(Layout.Cell, {span:12}, m(DatePicker, {
					id: 'ondate',
					label: _('ON_LABEL'),
					help: _('ON_DESCRIPTION'),
					value: ondate,
					onchange: function(newvalue) {
						ondate=newvalue;
					},
					boxed: true,
					autoclose: true,
				})),

				time !== 'on' && m(Layout.Cell, {span:6, spantablet:8}, m(DatePicker, {
						id: 'fromdate',
						label: _('FROM_LABEL'),
						help: _('FROM_DESCRIPTION'),
						value: fromdate,
						onchange: function(newvalue) {
							fromdate=newvalue;
						},
						boxed: true,
						autoclose: true,
					})),

				time !== 'on' && m(Layout.Cell, {span:6, spantablet:8}, m(DatePicker, {
					id: 'todate',
					label: _('TO_LABEL'),
					help: _('TO_DESCRIPTION'),
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
				label: _('FILTERS_LABEL'),
				help: _('FILTERS_DESCRIPTION'),
				leadingfaicon: 'filter',
				faicon: filters && 'times-circle',
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
				}}, m('tt', UriComposer.animatedUri())),
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
