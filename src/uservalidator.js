'use strict';
var m = require('mithril');
var UserValidator = {};

UserValidator._mockPreValidated = false;
UserValidator._mockPreValidationTimeoutMs = 1000;
UserValidator._mockPassword = 'caca';

UserValidator.isSessionOpen = function() {
	console.debug("checking previous validation", this);
	var self = this;
	var promise = new Promise(function(accept, reject) {
		setTimeout(function() {
			if (self._mockPreValidated === true) {
				console.log('simulated open session');
				promise.then(function() {m.redraw()})
				accept({
					nif: '12345678Z',
					name: 'Rodofo Valentino',
				});
			}
			else {
				console.log('simulated no session');
				promise.catch(function() {m.redraw()})
				reject({
					type: 'NonValidated',
				});
			}
		}, self._mockPreValidationTimeoutMs);
	});
	return promise;
};

UserValidator.exists = function() {
};

UserValidator.openSession = function(user, password) {
	var self = this;
	var promise = new Promise(function(accept, reject) {
		setTimeout(function() {
			if (self._mockPassword===password) {
				promise.then(function() {m.redraw()})
				accept({
					nif: '12345678Z',
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
