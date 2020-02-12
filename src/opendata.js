'use strict';
var m = require('mithril');
var moment = require('moment');
var _ = require('./translate');
var css = require('./style.styl');
var cssOpenData = require('./opendata.styl');
var Layout = require('./mdc/layout');
var Button = require('./mdc/button');
var Select = require('./mdc/select');
var Checkbox = require('./mdc/checkbox');
var TopAppBar = require('./mdc/topappbar');
var TabBar = require('./mdc/tabbar');
var TextField = require('./mdc/textfield');
var Card = require('./mdc/card');
var DatePicker = require('./datepicker');
var jsyaml = require('js-yaml');

var cuca = require('./img/cuca-somenergia.svg');

var OpenDataUri = require('./opendatauri');
var opendatauri = new OpenDataUri();

require('font-awesome/css/font-awesome.css');
require('webpack-roboto/sass/roboto.scss');
require('@material/typography/dist/mdc.typography.css').default;

var sending = false;
var result = undefined;
var apierror = undefined;
var viewmode = 'table';
var responsetype = 'table';
var tabModel = {
    active: 0
};
const viewModeTabs = [{
    text: _('VIEWMODE_TABLE'),
    id: 'table',
    disabled: false
},{
    text: _('VIEWMODE_YAML'),
    id: 'yaml',
    disabled: false
},{
    text: _('VIEWMODE_JSON'),
    id: 'json',
    disabled: false
}]


function doRequest() {
    sending=true;
    result=undefined;
    apierror=undefined;
    var promise = m.request({
        method: 'GET',
        deserialize: viewmode === 'table'? jsyaml.load: function(value) {return value},
        url: opendatauri.uri(),
        withCredentials: true,
    });
    promise.then(function(response){
        sending=false;
        result=response;
    });
    promise.catch(function(error){
        sending=false;
        apierror=error;
    });
}
function GIF() {
    sending=true;
    result=undefined;
    apierror=undefined;
    var img = new Image();
    img.src = opendatauri.uri()
    img.onload = function(){
        result = img.src;
        sending = false;
        m.redraw();
    }
    img.onerror = function() {
        doRequest();
    }
}

var OpenData = {
    view: function(vn) {
		var Layout = require('./mdc/layout');
        return m('.form.mdc-typography', 
            m(TopAppBar, {
                    title: [
                        m('h1', m('img.cuca', {src: cuca}), _('OPENDATAUI_TITLE')),
                        m('.seedocs', m('a', {href: '/docs', target: '_blank'}, _( 'API Documentation')))
                    ],
                    fixed: true
                }
            ),
            m(Layout, {className:'mdc-top-app-bar--fixed-adjust'},[			
			m('.disclaimer', _('ALPHA_DISCLAIMER')),
            m(Card,{className:'opendata__controls'},
                m('.header', [
                    m('.header__container',
                        m('.header__text', _('OPENDATA_CONTROLS_TITLE'))
                    ),
                    m('.header__after')
                ]),
                m(Layout.Row, [
    				m(Layout.Cell, {span:12},
                        m('.opendata__choose', [
                            m(Checkbox, {
                                id: 'data',
                                label: _('OBTAIN_DATA'),
                                checked: opendatauri.getResponseType() === 'data',
                                onchange: function(ev) {
                                    if (opendatauri.getResponseType() !== 'data' && ev.target.checked) {
                                        opendatauri.setResponseType('data');
                                        responsetype = 'table';
                                    }
                                },
                            }),
                            m(Checkbox, {
                                id: 'map',
                                label: _('OBTAIN_MAP'),
                                checked: opendatauri.getResponseType() === 'map',
                                onchange: function(ev) {
                                    if (opendatauri.getResponseType() !== 'map' && ev.target.checked) {
                                        if (opendatauri.getGeolevel() !=='state') {
                                            opendatauri.setGeolevel('ccaa');
                                        }
                                        opendatauri.setResponseType('map');
                                        responsetype = 'map';
                                    }
                                },
                            }),
                            m(".opendata-checkbox-helper-text",_('RESPONSE_TYPE_HELP'))
                        ]),
                    )
                ]),        
                m(Layout.Row, [
    				m(Layout.Cell, {span:12},
                        m(Select, {
                            id: 'metric',
                            label: _('METRIC_LABEL'),
                            help: _('METRIC_HELP'),
                            required: true,
                            value: opendatauri.getMetric(),
                            onchange: function(ev) {opendatauri.setMetric(ev.target.value);},
                            options: [{
                                text: _('Members'),
                                value: 'members',
                            },{
                                text: _('Contracts'),
                                value: 'contracts',
                            }],
                        })
                    )
                ]),    
                m(Layout.Row, [
    				m(Layout.Cell, {span:12},
                        m(Select, {
                            id: 'relativeMetric',
                            label: _('RELATIVE_METRIC_LABEL'),
                            help: _('RELATIVE_METRIC_HELP'),
                            value: opendatauri.getRelativeMetric(),
                            disabled: responsetype === 'table',
                            onchange: function(ev) {opendatauri.setRelativeMetric(ev.target.value);},
                            options: [{
                                text: _('Population'),
                                value: 'population',
                                disabled: responsetype === 'table',
                            }],
                        })
                    )
                ]),
                m(Layout.Row, [
    				m(Layout.Cell, {span:12},
                        m(Select, {
                            id: 'geolevel',
                            label: _('GEOLEVEL_LABEL'),
                            help: _('GEOLEVEL_HELP'),
                            value: opendatauri.getGeolevel(),
                            required: responsetype === 'map',
                            onchange: function(ev) {opendatauri.setGeolevel(ev.target.value);},
                            options: [{
                                text: _('Country'),
                                value: 'country',
                                disabled: responsetype === 'map'
                            },{
                                text: _('Region'),
                                value: 'ccaa',
                            },{
                                text: _('State'),
                                value: 'state',
                            },{
                                text: _('City'),
                                value: 'city',
                                disabled: responsetype === 'map'
                            }],
                        })
                        )
                    ]),
                    m(Layout.Row, [
    				m(Layout.Cell, {span:12},
                        m(Select, {
                            id: 'time',
                            label: _('TIME_LABEL'),
                            help: _('TIME_DESCRIPTION'),
                            required: true,
                            value: opendatauri.getTime(),
                            onchange: function(ev) {opendatauri.setTime(ev.target.value);},
                            options: [{
                                text: _('Single date'),
                                value: 'on',
                            },{
                                text: _('Yearly'),
                                value: 'yearly',
                            },{
                                text: _('Monthly'),
                                value: 'monthly',
                            },{
                                text: _('Weekly'),
                                value: 'weekly',
                                disabled: true,
                            }],
                        })
                    )
                ]),
    			m(Layout.Row, [
    				opendatauri.getTime()==='on' && m(Layout.Cell, {span:12}, m(DatePicker, {
    					id: 'ondate',
    					label: _('ON_LABEL'),
    					help: _('ON_DESCRIPTION'),
    					value: opendatauri.getOnDate(),
    					onchange: function(newvalue) {
    						opendatauri.setOnDate(newvalue);
    					},
    					boxed: true,
    					autoclose: true,
    				})),

    				opendatauri.getTime() !== 'on' && m(Layout.Cell, {span:6, spantablet:8}, m(DatePicker, {
    						id: 'fromdate',
    						label: _('FROM_LABEL'),
    						help: _('FROM_DESCRIPTION'),
    						value: opendatauri.getFromDate(),
    						onchange: function(newvalue) {
    							opendatauri.setFromDate(newvalue);
    						},
    						boxed: true,
    						autoclose: true,
    					})),

    				opendatauri.getTime() !== 'on' && m(Layout.Cell, {span:6, spantablet:8}, m(DatePicker, {
    					id: 'todate',
    					label: _('TO_LABEL'),
    					help: _('TO_DESCRIPTION'),
    					value: opendatauri.getToDate(),
    					onchange: function(newvalue) {
    						opendatauri.setToDate(newvalue);
    					},
    					boxed: true,
    					autoclose: true,
    				})),
    			]),
    			m(TextField, {
    				id: 'filters',
    				label: _('FILTERS_LABEL'),
    				help: _('FILTERS_DESCRIPTION'),
    				leadingfaicon: 'filter',
    				faicon: opendatauri.getFilters() && 'times-circle',
    				value: opendatauri.getFilters(),
    				iconaction: opendatauri.getFilters() && function() {
    					opendatauri.setFilters('');
    				},
    				oninput: function(ev) {
    					opendatauri.setFilters(ev.target.value);
    				},
    			}),
                responsetype === 'map' && m('.opendata__choose', [
                    m(Checkbox, {
                        id: 'default',
                        label: _('BROWSER_LANG'),
                        checked: opendatauri.getLanguage() === '',
                        onchange: function(ev) {
                            if (opendatauri.getLanguage() !== '' && ev.target.checked) {
                                opendatauri.setLanguage('');
                            }
                        },
                    }),
                    m(Checkbox, {
                        id: 'ca',
                        label: _('CA_LANG'),
                        checked: opendatauri.getLanguage() === 'ca',
                        onchange: function(ev) {
                            if (opendatauri.getLanguage() !== 'ca' && ev.target.checked) {
                                opendatauri.setLanguage('ca');
                            }
                        },
                    }),
                    m(Checkbox, {
                        id: 'es',
                        label: _('ES_LANG'),
                        checked: opendatauri.getLanguage() === 'es',
                        onchange: function(ev) {
                            if (opendatauri.getLanguage() !== 'es' && ev.target.checked) {
                                opendatauri.setLanguage('es');
                            }
                        },
                    }),
                    m(Checkbox, {
                        id: 'eu',
                        label: _('EU_LANG'),
                        checked: opendatauri.getLanguage() === 'eu',
                        onchange: function(ev) {
                            if (opendatauri.getLanguage() !== 'eu' && ev.target.checked) {
                                opendatauri.setLanguage('eu');
                            }
                        },
                    }),
                    m(Checkbox, {
                        id: 'gl',
                        label: _('GL_LANG'),
                        checked: opendatauri.getLanguage() === 'gl',
                        onchange: function(ev) {
                            if (opendatauri.getLanguage() !== 'gl' && ev.target.checked) {
                                opendatauri.setLanguage('gl');
                            }
                        },
                    }),
                    m(".opendata-checkbox-helper-text",_('LANGUAGE_HELP'))
                ]),
    			m('', {style: 'text-align: center',
                    },
    				m('', {style: {
    					padding: '12pt',
    					background: 'rgba(0,0,0,0.1)',
    					margin: '16pt 0pt',
    				}}, m('tt', opendatauri.highlightedUri().map(function(value) {
    					switch (value[0]) {
    						case 'O': return m('span',{className:'text-uri-out'}, value[1]);
    						case 'I': return m('span', {className:'text-uri-in'}, value[1]);
    						default: return m('span', value[1]);
    					}
    				}))),
    				m(Button, {
    					raised: true,
    					disabled: sending,
    					faicon: sending?"spinner.fa-spin":"paper-plane",
    					onclick: function() {
                            viewmode = responsetype;
    						if (responsetype=== 'map') {
                                if(opendatauri.getTime() !== 'on'){
                                    viewmode = 'gif';
                                    GIF()
                                } else {
                                    doRequest();
                                }
                            }
                            else{
                                doRequest();
                            }
                        }
    				}, _('Send')),
                ),
			),
            apierror && m('pre.red', "Error: ", apierror.message),
			result && [
                    m(Card,{className:'opendata__results', style: 'display: inline-block'},[
                        m('.header', [
                            m('.header__container',
                                m('.header__text', _('Result'))
                            ),
                            m('.header__after')
                        ]),
        
                        (viewmode !== 'map' && viewmode!== 'gif') && m(TabBar, {
                            index: 0,
                            onactivated: function(ev) {
                                tabModel.active = ev.detail.index;
                                viewmode = viewModeTabs[tabModel.active].id;
                            },
                            tabs: viewModeTabs
                        }),
        				viewmode==='table' && resultTable(result),
        				viewmode==='yaml' && m('pre', jsyaml.dump(result)),
        				viewmode==='json' && m('pre', JSON.stringify(result,null,2)),
                        viewmode==='map' && m('.map-view', m.trust(result)),
                        viewmode==='gif' && m('.gif-view',m('img#gif-result',{src:result})),
        			])
                ],
        ]));
    },
};

var levels = ['countries', 'ccaas', 'states', 'cities']

function resultTable(data) {
	return m('.result-table',m('table',
		m('tr',
			m('th', {colspan: levels.length+3},  _('Code')),
			m('th', _('Name')),
			data.dates.map(function(date, i) {
				return m('th', {
					style: 'width: 12ex; text-align:right',
					}, 
					moment(date).format('YYYY-MM-DD'));
			})
		),
        subresultTable(data,0,0)
        )
	);
}


function subresultTable(subresult, level, code, i) {
	if (subresult===undefined) return [];
	var children = levels[level] && subresult[levels[level]];
	var name = subresult.name || _('Global');
	var indent = levels.length - level + 1;
	return [
		m('tr', {style: {'background-color': (i&1?'#eee':'white'), }}, [
			m('td', {colspan: level+1}),
			m('td', m('span.fa.fa-icon.fa-plus')),
			m('td', {colspan: indent}, code),
			m('td', name),
			subresult.values.map(function(value, i) {
				return m('td', {style: 'text-align: right'}, value);
			}),
		]),
		children!==undefined &&
		Object.keys(children).map(function(code, i) {
			return subresultTable(children[code], level+1, code, i);
		}),
	];
}


window.onload = function() {
    var element = document.getElementById("mithril-target");
    m.mount(element, OpenData);
    //traceFocus();
};
module.exports=OpenData;
// vim: noet ts=4 sw=4
