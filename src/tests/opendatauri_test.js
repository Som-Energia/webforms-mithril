'use strict';
var o = require("ospec")
var moment = require('moment');

var OpendataUri = require("../opendatauri.js")
function compare(arr1, arr2){
    console.log("Comparo " + arr1 +" and " + arr2);
    if (arr1.length != arr2.length){
        console.log("Different length arrays " + arr1 +" and " + arr2);
        return false;

    }
    for (var i=0; i<arr1.length; i++){
        if (arr1[i].length != arr2[i].length){
            console.log("Different length subarrays " + arr1[i]+ " and " + arr2[i]);
            return false;
        }
        for (var j=0; j<arr1[i].length; j++){
            if (arr1[i][j]!=arr2[i][j]){
                console.log("Different item " + arr1[i][j]+ " and " + arr2[i][j]);
                return false;
            }
        }
    }
    return true;
}
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
            opendatauri.setFromDate(moment("20190101", "YYYYMMDD"))
            o(opendatauri.getFromDate().format('YYYY-MM-DD')).equals('2019-01-01')
        })        
        o("onDate", function() {
            opendatauri.setOnDate(moment("20190101", "YYYYMMDD"))
            o(opendatauri.getOnDate().format('YYYY-MM-DD')).equals('2019-01-01')
        })        
        o("toDate", function() {
            opendatauri.setToDate(moment("20190101", "YYYYMMDD"))
            o(opendatauri.getToDate().format('YYYY-MM-DD')).equals('2019-01-01')
        })        
        o("filters", function() {
            opendatauri.setFilters('filter1')
            o(opendatauri.getFilters()).equals('filter1')
        })        
    })
    o.spec("Uri when values set", function() {
        var opendatauri = new OpendataUri()
        o("default", function() {
            o(opendatauri.uri()).equals('https://opendata.somenergia.coop/v0.2/members')
        })
        o("Metric set", function() {
            opendatauri.setMetric('contracts')
            o(opendatauri.uri()).equals('https://opendata.somenergia.coop/v0.2/contracts')
        })
        o("geolevel set", function() {
            opendatauri.setGeolevel('city')
            o(opendatauri.uri()).equals('https://opendata.somenergia.coop/v0.2/contracts/by/city')
        })
        o("with filters", function() {
            opendatauri.setFilters('country=ES')
            o(opendatauri.uri()).equals('https://opendata.somenergia.coop/v0.2/contracts/by/city?country=ES')
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
    o.spec("With a frequency", function() {
        var opendatauri = new OpendataUri()
        o("no from nor to", function() {
            opendatauri.setTime('yearly')
            o(opendatauri.uri()).equals('https://opendata.somenergia.coop/v0.2/members/yearly')
        })
        o("From set", function() {
            opendatauri.setFromDate(moment("20190101", "YYYYMMDD"))
            o(opendatauri.uri()).equals('https://opendata.somenergia.coop/v0.2/members/yearly/from/2019-01-01')
        })
        var opendatauri2 = new OpendataUri()
        o("To date set", function() {
            opendatauri2.setTime('yearly')
            opendatauri2.setToDate(moment("20190101", "YYYYMMDD"))
            o(opendatauri2.uri()).equals('https://opendata.somenergia.coop/v0.2/members/yearly/to/2019-01-01')
        })
        o("Both set", function() {
            opendatauri2.setTime('yearly')
            opendatauri2.setFromDate(moment("20180101", "YYYYMMDD"))
            opendatauri2.setToDate(moment("20190101", "YYYYMMDD"))
            o(opendatauri2.uri()).equals('https://opendata.somenergia.coop/v0.2/members/yearly/from/2018-01-01/to/2019-01-01')
        })
        o("Return to time undefined", function() {
            opendatauri2.setTime('on')
            o(opendatauri2.uri()).equals('https://opendata.somenergia.coop/v0.2/members')
        })
    })
    o.spec("HighlightedUri", function() {
        o("Default", function() {
            var opendatauri = new OpendataUri()
            var result = opendatauri.highlightedUri()
            var expected = [['K', 'https://opendata.somenergia.coop/v0.2/members']]
            o(compare(result, expected)).equals(true)
        })
        o("Changed metric", function() {
            var opendatauri = new OpendataUri()
            console.log("a changed")
            opendatauri.setMetric('contracts')
            var result = opendatauri.highlightedUri()
            var expected = [['K', 'https://opendata.somenergia.coop/v0.2/'], ['I', 'contracts'], ['O', 'members']]
            o(compare(result, expected)).equals(true)
        })
        o("Changed geolevel", function() {
            var opendatauri = new OpendataUri()
            opendatauri.setGeolevel('ccaa')
            var result = opendatauri.highlightedUri()
            var expected = [['K', 'https://opendata.somenergia.coop/v0.2/members'], ['I', '/by/ccaa'], ['O', '']]
            o(compare(result, expected)).equals(true)
        })
        o("Changed geolevel-> return to undefined", function() {
            console.log("new atest");
            var opendatauri = new OpendataUri()
            opendatauri.setGeolevel('ccaa')
            opendatauri.setGeolevel(undefined)
            var result = opendatauri.highlightedUri()
            var expected = [['K', 'https://opendata.somenergia.coop/v0.2/members'], ['I',''], ['O', '/by/ccaa']]
            o(compare(result, expected)).equals(true)
        })
        /*o("Changed frequency", function() {
            var opendatauri = new OpendataUri()
            console.log("a changed")
            opendatauri.setTime('yearly')
            var result = opendatauri.highlightedUri()
            var expected = [['K', 'https://opendata.somenergia.coop/v0.2/members'], ['I', '/yearly'], ['O', '']]
            o(compare(result, expected)).equals(true)
        })
        o("Changed frequency -> back to 'on'", function() {
            var opendatauri = new OpendataUri()
            console.log("a changed")
            opendatauri.setTime('yearly')
            opendatauri.setTime('on')
            var result = opendatauri.highlightedUri()
            var expected = [['K', 'https://opendata.somenergia.coop/v0.2/members'], ['I', ''], ['O', '/yearly']]
            o(compare(result, expected)).equals(true)
        })*/
    })
})