'use strict';

describe("math", function() {
	describe("arithmetics", function() {
		test("addition", function() {
			expect(1 + 1).toBe(2)
		})
		test("subtraction", function() {
			expect(1 - 1).not.toBe(2)
		})
	})
})
// vim: et ts=2 sw=2
