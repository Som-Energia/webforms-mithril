var m = require('mithril')
var MyComponent = require("./my-component.js")
var Button = require('./mdc/button.js');
var OpenData = require('./opendata.js')
describe("Positive control", function() {
    test("My component", function() {
        var c = m(MyComponent,{text: "Hello World!"})
        expect(c.attrs['text']).toBe("Hello World!");
    })
})
describe("Button", function() {
    test("btn", function() {
        var rised =Button.view({attrs: {"raised":true}})
        expect(rised.attrs.className).toBe("mdc-button mdc-button--raised");
    })
})
describe("Opendata", function() {
    var layout = OpenData.view()
    test("layout", function(){
        expect(layout.tag).toBe('div')
        expect(layout.attrs.className).toBe('form mdc-typography')
        expect(layout.children.length).toBe(1)   
    })
    var opendata = layout.children[0].children
    test("First child: title", function() {
        var title = opendata[0]
        expect(title.tag).toBe('h1');
        expect(title.text).toBe('OPENDATAUI_TITLE');
    })
    test("Second child: disclaimer", function() {
        var disclaimer = opendata[1]
        expect(disclaimer.tag).toBe('div');
        expect(disclaimer.attrs.className).toBe('disclaimer')
        expect(disclaimer.text).toBe('ALPHA_DISCLAIMER');
    })
    test("Child 3: Metric select", function() {
        var metricSelect = opendata[2]
        expect(metricSelect.attrs.id).toBe('metric')
        expect(metricSelect.attrs.options).toStrictEqual([{text: 'Members',value:'members'},{text:'Contracts', value: 'contracts'} ]);
    })
})