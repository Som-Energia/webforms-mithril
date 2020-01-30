var m = require('mithril')
var tidy = require('mithril-jest').tidy
function MyComponent() {
    return {
        view: function (vnode) {
            return m("div", vnode.attrs.text)
        }
    }
}
describe("Snapshot Example", function() {
    test("Positive control", function() {
        var c = m(MyComponent,{text: "Bye!"})
        const html = tidy(c);
        expect(html).toMatchSnapshot()
    })
    test("Negative control", function() {
        var c = m(MyComponent,{text: "Hello!"})
        const html = tidy(c);
        expect(html).toMatchSnapshot()
    })
})