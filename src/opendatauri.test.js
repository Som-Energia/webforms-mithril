'use strict';
var moment = require('moment')
var OpendataUri = require("./opendatauri.js")

describe("OpendataUri", function() {
    describe("default", function() {
        var opendatauri= new OpendataUri()
        test("responseType", function() {
            expect(opendatauri.getResponseType()).toBe('data')
        })
        test("metric", function() {
            expect(opendatauri.getMetric()).toBe('members')
        })
        test("geolevel", function() {
            expect(opendatauri.getGeolevel()).toBe('')
        })
        test("time (frequency)", function() {
            expect(opendatauri.getTime()).toBe('on')
        })
        test("onDate", function() {
            expect(opendatauri.getOnDate()).toBe(undefined)
        })
        test("fromDate", function() {
            expect(opendatauri.getFromDate()).toBe(undefined)
        })
        test("toDate", function() {
            expect(opendatauri.getToDate()).toBe(undefined)
        })
        test("filters", function() {
            expect(opendatauri.getFilters()).toBe()
        })
    })
    describe("Set Values Independently", function() {
        var opendatauri = new OpendataUri()
        test("metric", function() {
            opendatauri.setMetric('contracts')
            expect(opendatauri.getMetric()).toBe('contracts')
        })
        test("geolevel", function() {
            opendatauri.setGeolevel('ccaa')
            expect(opendatauri.getGeolevel()).toBe('ccaa')
        })
        test("time (frequency)", function() {
            opendatauri.setTime('yearly')
            expect(opendatauri.getTime()).toBe('yearly')
        })
        test("fromDate", function() {
            opendatauri.setFromDate(moment("20190101", "YYYYMMDD"))
            expect(opendatauri.getFromDate().format("YYYY-MM-DD")).toBe('2019-01-01')
        })
        test("onDate", function() {
            opendatauri.setOnDate(moment("20190101", "YYYYMMDD"))
            expect(opendatauri.getOnDate().format("YYYY-MM-DD")).toBe('2019-01-01')
        })
        test("toDate", function() {
            opendatauri.setToDate(moment("20190101", "YYYYMMDD"))
            expect(opendatauri.getToDate().format("YYYY-MM-DD")).toBe('2019-01-01')
        })
        test("filters", function() {
            opendatauri.setFilters('filter1')
            expect(opendatauri.getFilters()).toBe('filter1')
        })
    })
    describe("Uri when values set", function() {
        var opendatauri = new OpendataUri()
        test("default", function() {
            expect(opendatauri.uri()).toBe('https://opendata.somenergia.coop/v0.2/members')
        })
        test("Metric set", function() {
            opendatauri.setMetric('contracts')
            expect(opendatauri.uri()).toBe('https://opendata.somenergia.coop/v0.2/contracts')
        })
        test("geolevel set", function() {
            opendatauri.setGeolevel('city')
            expect(opendatauri.uri()).toBe('https://opendata.somenergia.coop/v0.2/contracts/by/city')
        })
        test("with filters", function() {
            opendatauri.setFilters('country=ES')
            expect(opendatauri.uri()).toBe('https://opendata.somenergia.coop/v0.2/contracts/by/city?country=ES')
        })
    })
    describe("On a date", function() {
        var opendatauri = new OpendataUri()
        test("no date requested", function() {
            expect(opendatauri.uri()).toBe('https://opendata.somenergia.coop/v0.2/members')
        })
        test("Date requested", function() {
            opendatauri.setOnDate(moment("20190101", "YYYYMMDD"))
            expect(opendatauri.uri()).toBe('https://opendata.somenergia.coop/v0.2/members/on/2019-01-01')
        })
        test("Change frequency and return to ondate -> keep ondate", function() {
            opendatauri.setTime('yearly')
            opendatauri.setTime('on')
            expect(opendatauri.uri()).toBe('https://opendata.somenergia.coop/v0.2/members/on/2019-01-01')
        })
        test("Return to undefined", function() {
            opendatauri.setOnDate(undefined)
            expect(opendatauri.uri()).toBe('https://opendata.somenergia.coop/v0.2/members')
        })
    })
    describe("With a frequency", function() {
        var opendatauri = new OpendataUri()
        test("no from nor to", function() {
            opendatauri.setTime('yearly')
            expect(opendatauri.uri()).toBe('https://opendata.somenergia.coop/v0.2/members/yearly')
        })
        test("From set", function() {
            opendatauri.setFromDate(moment("20190101", "YYYYMMDD"))
            expect(opendatauri.uri()).toBe('https://opendata.somenergia.coop/v0.2/members/yearly/from/2019-01-01')
        })
        var opendatauri2 = new OpendataUri()
        test("To date set", function() {
            opendatauri2.setTime('yearly')
            opendatauri2.setToDate(moment("20190101", "YYYYMMDD"))
            expect(opendatauri2.uri()).toBe('https://opendata.somenergia.coop/v0.2/members/yearly/to/2019-01-01')
        })
        test("Both set", function() {
            opendatauri2.setTime('yearly')
            opendatauri2.setFromDate(moment("20180101", "YYYYMMDD"))
            opendatauri2.setToDate(moment("20190101", "YYYYMMDD"))
            expect(opendatauri2.uri()).toBe('https://opendata.somenergia.coop/v0.2/members/yearly/from/2018-01-01/to/2019-01-01')
        })
        test("Return to time undefined", function() {
            opendatauri2.setTime('on')
            expect(opendatauri2.uri()).toBe('https://opendata.somenergia.coop/v0.2/members')
        })
        test("Return to frequency -> keep from a to date", function() {
            opendatauri2.setTime('yearly')
            expect(opendatauri2.uri()).toBe('https://opendata.somenergia.coop/v0.2/members/yearly/from/2018-01-01/to/2019-01-01')
        })
    })
})
describe("HighlightedUri", function() {
    describe("Simple fields", function() {
        test("Default", function() {
            var opendatauri = new OpendataUri()
            var result = opendatauri.highlightedUri()
            var expected = [['K', 'https://opendata.somenergia.coop/v0.2/members']]
            expect(result).toStrictEqual(expected)
        })
        test("Changed metric", function() {
            var opendatauri = new OpendataUri()
            opendatauri.setMetric('contracts')
            var result = opendatauri.highlightedUri()
            var expected = [['K', 'https://opendata.somenergia.coop/v0.2/'], ['I', 'contracts'], ['O', 'members']]
            expect(result).toStrictEqual(expected)
        })
        test("Changed geolevel", function() {
            var opendatauri = new OpendataUri()
            opendatauri.setGeolevel('ccaa')
            var result = opendatauri.highlightedUri()
            var expected = [['K', 'https://opendata.somenergia.coop/v0.2/members'], ['I', '/by/ccaa'], ['O', '']]
            expect(result).toStrictEqual(expected)
        })
        test("Changed geolevel-> return to undefined", function() {
            var opendatauri = new OpendataUri()
            opendatauri.setGeolevel('ccaa')
            opendatauri.setGeolevel(undefined)
            var result = opendatauri.highlightedUri()
            var expected = [['K', 'https://opendata.somenergia.coop/v0.2/members'], ['I',''], ['O', '/by/ccaa']]
            expect(result).toStrictEqual(expected)
        })
        test("Filters", function() {
            var opendatauri = new OpendataUri()
            opendatauri.setFilters('ca=2')
            var result = opendatauri.highlightedUri()
            var expected = [['K', 'https://opendata.somenergia.coop/v0.2/members'], ['I', '?ca=2'], ['O','']]
            expect(result).toStrictEqual(expected)
        })
        test("Trying to set same value", function() {
            var opendatauri = new OpendataUri()
            opendatauri.setMetric('contracts')
            opendatauri.setOnDate(moment("20190101", "YYYYMMDD"))
            opendatauri.setMetric('contracts')
            var result = opendatauri.highlightedUri()
            var expected = [['K', 'https://opendata.somenergia.coop/v0.2/contracts'], ['I', '/on/2019-01-01'], ['O', '']]
            expect(result).toStrictEqual(expected)
        })
    })
    describe("Fields with consequences", function() {
        test("Changed frequency", function() {
            var opendatauri = new OpendataUri()
            opendatauri.setTime('yearly')
            var result = opendatauri.highlightedUri()
            var expected = [['K', 'https://opendata.somenergia.coop/v0.2/members'], ['I', '/yearly'], ['O', '']]
            expect(result).toStrictEqual(expected)
        })
        test("Changed frequency and fromDate -> back to 'on'", function() {
            var opendatauri = new OpendataUri()
            opendatauri.setTime('yearly')
            opendatauri.setFromDate(moment("20190101", "YYYYMMDD"))
            opendatauri.setTime('on')
            var result = opendatauri.highlightedUri()
            var expected = [['K', 'https://opendata.somenergia.coop/v0.2/members'], ['I', ''], ['O', '/yearly/from/2019-01-01']]
            expect(result).toStrictEqual(expected)
        })
        test("Changed on date", function() {
            var opendatauri = new OpendataUri()
            opendatauri.setOnDate(moment("20190101", "YYYYMMDD"))
            var result = opendatauri.highlightedUri()
            var expected = [['K', 'https://opendata.somenergia.coop/v0.2/members'], ['I', '/on/2019-01-01'], ['O', '']]
            expect(result).toStrictEqual(expected)
            opendatauri.setOnDate(moment("20150101", "YYYYMMDD"))
            var result = opendatauri.highlightedUri()
            var expected = [['K', 'https://opendata.somenergia.coop/v0.2/members/on/'], ['I', '2015-01-01'], ['O', '2019-01-01']]
            expect(result).toStrictEqual(expected)
        })
        test("Changed on date -> clear onDate", function() {
            var opendatauri = new OpendataUri()
            opendatauri.setOnDate(moment("20190101", "YYYYMMDD"))
            opendatauri.setOnDate(undefined)
            var result = opendatauri.highlightedUri()
            var expected = [['K', 'https://opendata.somenergia.coop/v0.2/members'], ['I', ''], ['O', '/on/2019-01-01']]
            expect(result).toStrictEqual(expected)
        })
        test("Set from date ", function() {
            var opendatauri = new OpendataUri()
            opendatauri.setTime('yearly')
            opendatauri.setFromDate(moment("20190101", "YYYYMMDD"))
            var result = opendatauri.highlightedUri()
            var expected = [['K', 'https://opendata.somenergia.coop/v0.2/members/yearly'], ['I', '/from/2019-01-01'], ['O', '']]
            expect(result).toStrictEqual(expected)
        })
        test("Change from date ", function() {
            var opendatauri = new OpendataUri()
            opendatauri.setTime('yearly')
            opendatauri.setFromDate(moment("20190101", "YYYYMMDD"))
            opendatauri.setFromDate(moment("20150101", "YYYYMMDD"))
            var result = opendatauri.highlightedUri()
            var expected = [['K', 'https://opendata.somenergia.coop/v0.2/members/yearly/from/'], ['I', '2015-01-01'], ['O', '2019-01-01']]
            expect(result).toStrictEqual(expected)
        })
        test("Set to date ", function() {
            var opendatauri = new OpendataUri()
            opendatauri.setTime('yearly')
            opendatauri.setToDate(moment("20190101", "YYYYMMDD"))
            var result = opendatauri.highlightedUri()
            var expected = [['K', 'https://opendata.somenergia.coop/v0.2/members/yearly'], ['I', '/to/2019-01-01'], ['O', '']]
            expect(result).toStrictEqual(expected)
        })
        test("Change to date ", function() {
            var opendatauri = new OpendataUri()
            opendatauri.setTime('yearly')
            opendatauri.setToDate(moment("20190101", "YYYYMMDD"))
            opendatauri.setToDate(moment("20150101", "YYYYMMDD"))
            var result = opendatauri.highlightedUri()
            var expected = [['K', 'https://opendata.somenergia.coop/v0.2/members/yearly/to/'], ['I', '2015-01-01'], ['O', '2019-01-01']]
            expect(result).toStrictEqual(expected)
        })
        test("Return to frequency -> keep from a to date", function() {
            var opendatauri = new OpendataUri()
            opendatauri.setTime('yearly')
            opendatauri.setFromDate(moment("20150101", "YYYYMMDD"))
            opendatauri.setToDate(moment("20160101", "YYYYMMDD"))
            opendatauri.setTime('on')
            opendatauri.setOnDate(moment("20190101", "YYYYMMDD"))
            opendatauri.setTime('yearly')
            var result = opendatauri.highlightedUri()
            var expected = [['K', 'https://opendata.somenergia.coop/v0.2/members'], ['I', '/yearly/from/2015-01-01/to/2016-01-01'], ['O', '/on/2019-01-01']]
            expect(result).toStrictEqual(expected)
        })
        test("Values middle uri -> keep part at the end", function() {
            var opendatauri = new OpendataUri()
            opendatauri.setTime('yearly')
            opendatauri.setToDate(moment("20190101", "YYYYMMDD"))
            opendatauri.setFromDate(moment("20150101", "YYYYMMDD"))
            opendatauri.setTime('monthly')
            var result = opendatauri.highlightedUri()
            var expected = [['K', 'https://opendata.somenergia.coop/v0.2/members/'], ['I', 'monthly'], ['O', 'yearly'], ['K','/from/2015-01-01/to/2019-01-01']]
            expect(result).toStrictEqual(expected)
        })
        test("Set same todate and fromdate", function() {
            var opendatauri = new OpendataUri()
            opendatauri.setTime('yearly')
            opendatauri.setFromDate(moment("20150101", "YYYYMMDD"))
            opendatauri.setToDate(moment("20190101", "YYYYMMDD"))
            opendatauri.setFromDate(moment("20190101", "YYYYMMDD"))
            var result = opendatauri.highlightedUri()
            var expected = [['K', 'https://opendata.somenergia.coop/v0.2/members/yearly/from/'], ['I', '2019-01-01'], ['O', '2015-01-01'], ['K','/to/2019-01-01']]
            expect(result).toStrictEqual(expected)
        })
    })
})
describe("OpendataUri when map requested", function() {
    describe("Uri", function() {
        var opendatauri= new OpendataUri()
        opendatauri.setResponseType('map')
        test("getter", function() {
            expect(opendatauri.getResponseType()).toBe('map')
        })
        test("uri", function() {
            expect(opendatauri.uri()).toBe('https://opendata.somenergia.coop/v0.2/map/members')
        })
        test("uri when many parameters set", function() {
            opendatauri.setTime('yearly')
            opendatauri.setFromDate(moment("20150101", "YYYYMMDD"))
            opendatauri.setToDate(moment("20190101", "YYYYMMDD"))
            expect(opendatauri.uri()).toBe('https://opendata.somenergia.coop/v0.2/map/members/yearly/from/2015-01-01/to/2019-01-01')
        })
    })
    describe("HighlightedUri", function() {
        var opendatauri= new OpendataUri()
        test("Set type map", function() {
            opendatauri.setResponseType('map')
            var expected = [['K', 'https://opendata.somenergia.coop/v0.2'], ['I', '/map'],['O', ''],['K','/members']]
            expect(opendatauri.highlightedUri()).toStrictEqual(expected)
        })
        test("return to data", function() {
            opendatauri.setResponseType('data')
            var expected = [['K', 'https://opendata.somenergia.coop/v0.2'], ['I', ''],['O', '/map'],['K','/members']]
            expect(opendatauri.highlightedUri()).toStrictEqual(expected)
        })
    })
})
describe("Relative metric", function() {
    describe("Uri", function() {
        var opendatauri= new OpendataUri()
        test("default", function() {
            expect(opendatauri.getRelativeMetric()).toBe('')
        })
        test("getter", function() {
            opendatauri.setRelativeMetric('population')
            expect(opendatauri.getRelativeMetric()).toBe('population')
        })
        test("uri", function() {
            expect(opendatauri.uri()).toBe('https://opendata.somenergia.coop/v0.2/members/per/population')
        })
        test("uri when many parameters set", function() {
            opendatauri.setResponseType('map')
            opendatauri.setTime('yearly')
            opendatauri.setFromDate(moment("20150101", "YYYYMMDD"))
            opendatauri.setToDate(moment("20190101", "YYYYMMDD"))
            expect(opendatauri.uri()).toBe('https://opendata.somenergia.coop/v0.2/map/members/per/population/yearly/from/2015-01-01/to/2019-01-01')
        })
    })
    describe("HighlightedUri", function() {
        var opendatauri= new OpendataUri()
        test("Set relative metric", function() {
            opendatauri.setRelativeMetric('population')
            var expected = [['K', 'https://opendata.somenergia.coop/v0.2/members'], ['I', '/per/population'],['O', '']]
            expect(opendatauri.highlightedUri()).toStrictEqual(expected)
        })
        test("return not relative", function() {
            opendatauri.setRelativeMetric('')
            var expected = [['K', 'https://opendata.somenergia.coop/v0.2/members'], ['I', ''],['O', '/per/population']]
            expect(opendatauri.highlightedUri()).toStrictEqual(expected)
        })
        test("return not relative when other parameters set", function() {
            opendatauri.setTime('yearly')
            opendatauri.setRelativeMetric('population')
            opendatauri.setRelativeMetric('')
            var expected = [['K', 'https://opendata.somenergia.coop/v0.2/members'], ['I', ''],['O', '/per/population'], ['K', '/yearly']]
            expect(opendatauri.highlightedUri()).toStrictEqual(expected)
        })
    })
})
describe("Language", function() {
    describe("Uri", function() {
        var opendatauri= new OpendataUri()
        test("default", function() {
            expect(opendatauri.getLanguage()).toBe('')
        })
        test("getter", function() {
            opendatauri.setLanguage('ca')
            expect(opendatauri.getLanguage()).toBe('ca')
        })
        test("uri", function() {
            expect(opendatauri.uri()).toBe('https://opendata.somenergia.coop/v0.2/members?lang=ca')
        })
        test("uri whith other filters", function() {
            opendatauri.setFilters('filter')
            expect(opendatauri.uri()).toBe('https://opendata.somenergia.coop/v0.2/members?filter&lang=ca')
        })
    })
    describe("HighlightedUri", function() {
        var opendatauri= new OpendataUri()
        test("Set language", function() {
            opendatauri.setLanguage('ca')
            var expected = [['K', 'https://opendata.somenergia.coop/v0.2/members'], ['I', '?lang=ca'],['O', '']]
            expect(opendatauri.highlightedUri()).toStrictEqual(expected)
        })
        test("Set Language when other filters", function() {
            var opendatauri= new OpendataUri()
            opendatauri.setFilters('filter')
            opendatauri.setLanguage('ca')
            var expected = [['K', 'https://opendata.somenergia.coop/v0.2/members?filter'], ['I', '&lang=ca'],['O', '']]
            expect(opendatauri.highlightedUri()).toStrictEqual(expected)
        })
        test("return to default language", function() {
            opendatauri.setLanguage('')
            var expected = [['K', 'https://opendata.somenergia.coop/v0.2/members'], ['I', ''],['O', '?lang=ca']]
            expect(opendatauri.highlightedUri()).toStrictEqual(expected)
        })
        test("Language set -> add filters", function(){
            var opendatauri = new OpendataUri()
            opendatauri.setLanguage('ca')
            opendatauri.setFilters('filter')
            var expected = [['K', 'https://opendata.somenergia.coop/v0.2/members?'], ['I', 'filter&'],['O', ''],['K', 'lang=ca']]
            expect(opendatauri.highlightedUri()).toStrictEqual(expected)
        })
        test("Language set -> remove filters", function(){
            var opendatauri = new OpendataUri()
            opendatauri.setFilters('filter')
            opendatauri.setLanguage('ca')
            opendatauri.setFilters('')
            var expected = [['K', 'https://opendata.somenergia.coop/v0.2/members?'], ['I', ''], ['O', 'filter&'],['K', 'lang=ca']]
            expect(opendatauri.highlightedUri()).toStrictEqual(expected)
        })
    })
})

// vim: noet ts=4 sw=4