'use strict';
var m = require('mithril');
var _ = require('./translate');
var css = require('./style.styl');
var Layout = require('./mdc/layout');
var Button = require('./mdc/button');
var Select = require('./mdc/select');
var jsyaml = require('js-yaml');

require('font-awesome/css/font-awesome.css');
require('@material/typography/dist/mdc.typography.css').default;


var uriBase = 'https://opendata.somenergia.coop/';

var sending = false;
var result = undefined;
var apierror = undefined;
var metric = 'members';

var geolevel = '';
var time = 'last';

function uri() {
    var geolevelPart = geolevel?"/by/"+geolevel:"";
    var timePart = time==="last"?"":"/"+time;
    return 'http://0.0.0.0:5001/v0.2/'+metric+geolevelPart+timePart;
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
                help: _('Maximum level of detail'),
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
                    text: _('Last available'),
                    value: 'last',
                },{
                    text: _('A given date'),
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
            m("", "Demanant "+uri()),
            m(Button, {
                raised: true,
                disabled: sending,
                faicon: sending?"spinner.fa-spin":"paper-plane",
                onclick: function() {
                    doRequest();
                },
            }, "Envia"),
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
