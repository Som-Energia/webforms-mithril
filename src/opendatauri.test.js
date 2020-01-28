'use strict';
const o = require("ospec")
const OpenDataUri = require("./opendatauri");

o.spec("OpenDataUri", function() {
  o.spec("Uri", function() {
    o("url", function() {
      var defaultUri = new OpenDataUri();
      o(defaultUri.uri()).equals(
        '//v0.2/members'
      )
      var changedUri = new OpenDataUri('base');
      o(changedUri.uri()).equals(
        'base/members'
      )
    })
    o("setting metric", function() {
      var opendatauri = new OpenDataUri('base');
      opendatauri.setMetric('contracts')
			o(opendatauri.uri())
        .equals('base/contracts')

      opendatauri.setMetric('members')
			o(opendatauri.uri())
        .equals('base/members')
		})
    o.spec("Highligthed Uri", function() {
/*
      o(opendatauri.highlightedUri()).equals([
        ['K', 'base']
        ['K', '/members']
      ])
      opendatauri.setMetric('contracts')
      o(opendatauri.highlightedUri()).equals([
        ['K', 'base',],
        ['O', '/members'],
        ['I', '/contracts'],
      ])
*/
    })
	})
})
// vim: et ts=2 sw=2
