'use strict';
var m = require('mithril');
var _ = require('./translate');

var apibase = 'http://testing.somenergia.coop:5001'

const ONLINE = 'ONLINE';
const OFFLINE = 'OFFLINE';

function requestSom(uri) {
	var abortable = undefined;
	// A two level promise to turn some network success
	// into request rejections as well
	var promise = new Promise(function(resolve, reject) {
		m.request({
			method: 'GET',
			url: apibase+uri,
			withCredentials: true,
			config: function(xhr) {
				abortable = xhr;
			},
		})
		.then(function(response) {
			console.log('response', response);

			if (response.status === ONLINE) {
				resolve(response);
			} else if (response.status === OFFLINE) {
				reject(_('The backend server is offline'));
			} else {
				reject(_('Unexpected response'));
			}
		})
		.catch(function(reason) {
			console.log(_('Request failed'), apibase+uri, reason);
			reject(reason.message || _('Request failed'));
		})
		;
	});
	promise.abort = function() {
		console.log("Aborting request ",apibase+uri);
		abortable.abort()
	};
	return promise;
};




module.exports.requestSom = requestSom;

// vim: noet ts=4 sw=4
