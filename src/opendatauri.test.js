'use strict';
const OpenDataUri = require("./opendatauri");

describe("OpenDataUri", function() {
  describe("Uri", function() {
    test("url", function() {
      var defaultUri = new OpenDataUri();
      expect(defaultUri.uri()).toBe(
        '//v0.2/members'
      )
      var changedUri = new OpenDataUri('base');
      expect(changedUri.uri()).toBe(
        'base/members'
      )
    })
    test("setting metric", function() {
      var opendatauri = new OpenDataUri('base');
      opendatauri.setMetric('contracts')
			expect(opendatauri.uri())
        .toBe('base/contracts')

      opendatauri.setMetric('members')
			expect(opendatauri.uri())
        .toBe('base/members')
		})
    describe("Highligthed Uri", function() {
/*
      describe(opendatauri.highlightedUri()).toBe([
        ['K', 'base']
        ['K', '/members']
      ])
      opendatauri.setMetric('contracts')
      describe(opendatauri.highlightedUri()).toBe([
        ['K', 'base',],
        ['O', '/members'],
        ['I', '/contracts'],
      ])
*/
    })
	})
})
// vim: et ts=2 sw=2
