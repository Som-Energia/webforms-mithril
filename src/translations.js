'use strict';

function basename(path) {
	return path.split('/').pop().split('.').shift();
}

var translations = {};
const requireContext = require.context('./i18n', false, /\.yaml$/);
for (let key of requireContext.keys()) {
	const translation = requireContext(key);
	const langname = basename(key);
	translations[langname] = {
		values: translation
	};
}

module.exports = translations
