'use strict';


const LegalTexts = {
    get: function(name, lang) {
		var docCollection = this[name];
		if (!docCollection)
			return "<h2>Document not available</h2>";
        var doc = this[name][lang];
        if (doc) return doc;
        return this[name].es;
    },
    generalterms: {
        es: require('./data/generalterms-es.html'),
        ca: require('./data/generalterms-ca.html'),
        gl: require('./data/generalterms-gl.html'),
        eu: require('./data/generalterms-eu.html'),
    },
    privacypolicy: {
        es: require('./data/privacypolicy-es.html'),
        ca: require('./data/privacypolicy-ca.html'),
        gl: require('./data/privacypolicy-gl.html'),
        eu: require('./data/privacypolicy-eu.html'),
    },
    disclaimer: {
        es: require('./data/disclaimer-es.html'),
        ca: require('./data/disclaimer-ca.html'),
        gl: require('./data/disclaimer-gl.html'),
        eu: require('./data/disclaimer-eu.html'),
    },
};

module.exports = LegalTexts;

// vim: noet ts=4 sw=4
