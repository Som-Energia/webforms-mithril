'use strict';

// Mockup module for translations

const _ = require('i18n4v');
const moment = require('moment');
const translations = require('./translations');

require('moment/locale/es');
require('moment/locale/ca');
require('moment/locale/eu');
require('moment/locale/gl');

_.selectLanguage(Object.keys(translations), function(err, lang) {
	_.translator.add(translations[lang] || translations['es']);
	moment.locale(lang);
});

module.exports = _
