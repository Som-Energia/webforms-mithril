'use strict';
var m = require('mithril');
var UserValidator = {};

UserValidator._mockPreValidated = false;
UserValidator._mockPostValidated = true;

UserValidator.isValidated = function() {
	console.debug("checking previous validation", this);
	var self = this;
	var promise = new Promise(function(accept, reject) {
		setTimeout(function() {
			if (self._mockPreValidated === true) {
				console.log('accepting');
				promise.then(function() {m.redraw()})
				accept({
					dni: '12345678Z',
					name: 'Rodofo Valentino',
				});
			}
			else {
				console.log('rejecting');
				promise.catch(function() {m.redraw()})
				reject({
					type: 'NonValidated',
				});
			}
		}, 500);
	});
	return promise;
};

UserValidator.exists = function() {
};

UserValidator.validate = function(user, password) {
	var self = this;
	var promise = new Promise(function(accept, reject) {
		setTimeout(function() {
			if (self._mockPostValidated) {
				promise.then(function() {m.redraw()})
				accept({
					dni: '12345678Z',
					name: 'Rodofo Valentino',
				});
			}
			else {
				promise.then(function() {m.redraw()})
				reject({
					type: 'Wrong validation',
				});
			}
		}, 500);
	});
	return promise;
};

module.exports = UserValidator;

// vim: noet sw=4 ts=4
