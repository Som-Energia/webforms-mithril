'use strict';
var m = require('mithril');

function TokenRetriever() {
	var self = this;
	self.token = m.parseQueryString(location.search).token || false;
	self.loading = false;
	self.data = false;
	self.error = false;
	if (!self.token) { return; }
	self.loading = true;
	m.request({
		method: 'GET',
		url: 'http://localhost:5001/data/token/:token',
		data: {
			token: self.token,
		},
	}).then(function(response) {
		self.loading = false;
		if (response.state !== true) {
			self.error = response.data.error;
			self.errorDescription = response.data.description;
			return;
		}
		self.tokendata=response.data;
	});
};


module.exports = TokenRetriever;

// vim: noet ts=4 sw=4
