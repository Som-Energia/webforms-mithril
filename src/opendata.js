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
        return m('.form.mdc-typography', [
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
			time==='on' && m(DatePicker, {
				id: 'ondate',
				label: _('On'),
				help: _(
					'Date at which look for. '+
					'Default: last available.'),
				value: ondate,
				onchange: function(newvalue) {
					ondate=newvalue;
				},
				boxed: true,
				autoclose: true,
			}),

			time !== 'on' && m(DatePicker, {
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
			}),

			time !== 'on' && m(DatePicker, {
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
			}),

            m('',
				m(Button, {
					raised: true,
					disabled: sending,
					faicon: sending?"spinner.fa-spin":"paper-plane",
					onclick: function() {
						doRequest();
					},
				}, _('Send')),
				m.trust('&nbsp;'),
				_('Query: %{uri}', {uri: uri()}),
			),
            result && m('pre', jsyaml.dump(result)),
            apierror && m('pre.red', "Error: ", apierror.message),
        ]);
    },
};


window.onload = function() {
    var element = document.getElementById("mithril-target");
    m.mount(element, OpenData);
    //traceFocus();
};

// vim: noet ts=4 sw=4
