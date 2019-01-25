var m = require('mithril');
var _ = require('./translate');
var Select = require('./mdc/select');
var requestSom = require('./somapi').requestSom;
var Layout = require('./mdc/layout');
var Row = Layout.Row;
var Cell = Layout.Cell;


var LanguageChooser = {
	oninit: function(vn) {
		var self = this;
		self.languages = []; // TODO: Shared by instances
		self.language = undefined;
		self.error = undefined;

		self.updateLanguages();
	},

    updateLanguages: function() {
		var self = this;
		requestSom('/data/idiomes').then(function(data) {
            console.log('lang',data);
			self.languages = data.data.idiomes;
		}).catch(function(reason) {
			console.log("TODO: Failed", reason);
			self.error = _('Error loading languages');
		});
    },

	view: function(vn) {
		var self=this;
		return m(Row, [
			m(Cell, {span:12},
				m(Select, Object.assign({},{
					label: _('LANGUAGE'),
					boxed: true,
                    },vn.attrs,{
					options: this.languages.map(function(v) {
						return {
							value: v.code,
							text: v.name,
						};
					}),
					help: this.error?this.error:(
                        this.languages ? vn.attrs.help|| _('LANGUAGE'):
                        _('LOADING_HELP')
                        ),
					value: self.language,
					onchange: function (ev) {
						self.language = ev.target.value;
						vn.attrs.onvaluechanged && vn.attrs.onvaluechanged(self)
					},
				}))
			)
        ]);
    },
};





module.exports = LanguageChooser;


