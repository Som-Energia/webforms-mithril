'use strict';

// Mockup module for translations

const _ = require('i18n4v');
const moment = require('moment');
const translations = require('./translations');

_.selectLanguage(Object.keys(translations), function(err, lang) {
	_.translator.add(translations[lang] || translations['es']);
});

module.exports = _
