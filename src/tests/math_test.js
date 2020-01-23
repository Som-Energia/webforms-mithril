'use strict';
var o = require("ospec")

o.spec("math", function() {
	o.spec("arithmetics", function() {
		o("addition", function() {
			o(1 + 1).equals(2)
		})
		o("subtraction", function() {
			o(1 - 1).notEquals(2)
		})
	})
})
// vim: et ts=2 sw=2
