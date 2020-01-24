'use strict';
var o = require("ospec")
var moment = require('moment');

var OpendataUri = require("../opendatauri.js")

o.spec("OpendataUri", function() {
    o.spec("default", function() {
        var opendatauri= new OpendataUri()
        o("metric", function() {
            o(opendatauri.getMetric()).equals('members')
        })
        o("geolevel", function() {
            o(opendatauri.getGeolevel()).equals('')
        })
        o("time (frequency)", function() {
            o(opendatauri.getTime()).equals('on')
        })
        o("onDate", function() {
            o(opendatauri.getOnDate()).equals(undefined)
        })         
        o("fromDate", function() {
            o(opendatauri.getFromDate()).equals(undefined)
        })        
        o("toDate", function() {
            o(opendatauri.getToDate()).equals(undefined)
        })        
        o("filters", function() {
            o(opendatauri.getFilters()).equals()
        })        
    })
    o.spec("Set Values Independently", function() {
        var opendatauri = new OpendataUri()
        o("metric", function() {
            opendatauri.setMetric('contracts')
            o(opendatauri.getMetric()).equals('contracts')
        })
        o("geolevel", function() {
            opendatauri.setGeolevel('ccaa')
            o(opendatauri.getGeolevel()).equals('ccaa')
        })
        o("time (frequency)", function() {
            opendatauri.setTime('yearly')
            o(opendatauri.getTime()).equals('yearly')
        })        
        o("fromDate", function() {
            opendatauri.setFromDate('2019-01-01')
            o(opendatauri.getFromDate()).equals('2019-01-01')
        })        
        o("onDate", function() {
            opendatauri.setOnDate('2019-01-01')
            o(opendatauri.getOnDate()).equals('2019-01-01')
        })        
        o("toDate", function() {
            opendatauri.setToDate('2019-01-01')
            o(opendatauri.getToDate()).equals('2019-01-01')
        })        
        o("filters", function() {
            opendatauri.setFilters('filter1')
            o(opendatauri.getFilters()).equals('filter1')
        })        
    })
    o.spec("On a date", function() {
    
        var opendatauri = new OpendataUri()
        o("no date requested", function() {
            o(opendatauri.uri()).equals('https://opendata.somenergia.coop/v0.2/members')
        })
        o("Date requested", function() {
            opendatauri.setOnDate(moment("20190101", "YYYYMMDD"))
            o(opendatauri.uri()).equals('https://opendata.somenergia.coop/v0.2/members/on/2019-01-01')
        })
        o("Return to undefined", function() {
            opendatauri.setOnDate(undefined)
            o(opendatauri.uri()).equals('https://opendata.somenergia.coop/v0.2/members')
        })
    })
})