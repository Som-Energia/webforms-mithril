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
var metric = 'members';

var geolevel = undefined;

function uri() {
    var geolevelPart = geolevel?"/by/"+geolevel:"";
    return 'http://0.0.0.0:5001/v0.2/'+metric+geolevelPart;
}

function doRequest() {
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
            m("", "Demanant "+uri()),
            m(Button, {
                raised: true,
                disabled: sending,
                faicon: sending?"spinner.fa-spin":"paper-plane",
                onclick: function() {
                    sending=true;
                    doRequest();
                },
            }, "Envia"),
            result && m('pre', jsyaml.dump(result)),
        ]);
    },
};


window.onload = function() {
    var element = document.getElementById("mithril-target");
    m.mount(element, OpenData);
    //traceFocus();
};

// vim: noet ts=4 sw=4
