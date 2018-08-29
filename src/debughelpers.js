'use strict';

module.exports.traceFocus = function() {
	function trace() {
		console.log('focus:', document.activeElement);
	};
	window.addEventListener('focus', trace, true);
};

// vim: noet ts=4 sw=4
