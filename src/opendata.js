'use strict';
var m = require('mithril');
var _ = require('./translate');
var css = require('./style.styl');
var Layout = require('./mdc/layout');
var Button = require('./mdc/button');
var jsyaml = require('js-yaml');

require('font-awesome/css/font-awesome.css');
require('@material/typography/dist/mdc.typography.css').default;


var uriBase = 'https://opendata.somenergia.coop/';

var sending = false;

var uriParams = {
    metric: "members",
    frequency: "on",
    geolevel: "",
    version: "v0.2",
    date: "2018-08-01",
}

function uri() {
    return 'http://0.0.0.0:5001/v0.2/members';
}

function doRequest() {
    var promise = m.request({
        method: 'GET',
        deserialize: jsyaml.load,
        url: uri(),
        withCredentials: true,
    });
    promise.then(function(resultat){
        console.log("Resultat:",resultat)
    });
    promise.catch(function(error){
        console.log("Error:",error)
    });
}

var OpenData = {
    view: function(vn) {
        return m('.form.mdc-typography', [
            m("", "Demanant "+uri()),
            m(Button, {
                raised: true,
                disabled: sending,
                faicon: sending?"spinner.fa-spin":"paper-plane",
                onclick: function() {
                    sending = true;
                    doRequest();
                },
            }, "Envia"),
        ]);
    },
};


window.onload = function() {
    var element = document.getElementById("mithril-target");
    m.mount(element, OpenData);
    //traceFocus();
};

// vim: noet ts=4 sw=4
