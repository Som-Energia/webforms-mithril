
global.window = require("mithril/test-utils/browserMock.js")();
global.document = window.document;
var jsdom = require("jsdom")
var dom = new jsdom.JSDOM("", {
    // So we can get `requestAnimationFrame`
    pretendToBeVisual: true,
})
global.requestAnimationFrame = dom.window.requestAnimationFrame
global.browser = global.navigator = {
  userAgent: 'node.js',
  language: 'es-ES',
  languages: ['es-Es'],
};

m = require('mithril');

// Collect all tests
var context = require.context('./', true, /.test.js$/);
context.keys().forEach(context);

// Hacks for ospec
process.exit = function() {};
process.stdout = {isTTY: true};

o = require('ospec').default;
o.run()

module.exports = context;


