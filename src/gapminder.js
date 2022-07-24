'use strict';

var d3 = require('d3');
var m = require('mithril');
const _ = require('./translate');
var css = require('./style.styl');
require('./gapminder.styl');
require('font-awesome/css/font-awesome.css');
require('@material/typography/dist/mdc.typography.css').default;
var yaml = require('js-yaml');

var apibase = 'http://localhost:5001/v0.2';
var apibase = 'https://opendata.somenergia.coop/v0.2';

function fetchyaml(uri) {
	return d3.text(uri)
		.then(response => {false && console.debug(response); return response})
		.then(text => {false && console.debug(text); return yaml.safeLoad(text)})
}

var defaultLevel = 'ccaa';

var OpenData = {}
OpenData.metrics = {};
OpenData.pools = {};
OpenData.selectedPool = []

OpenData.loadRelativeMetrics = function() {
	// TODO: This should be taken from API
	const ccaaPopulationTsv = require('dsv-loader?delimiter=\t!./data/poblacio_ccaa-20140101.csv');
	OpenData.population = {}
	OpenData.populationByCCAA = OpenData.population['ccaas'] = {};
	ccaaPopulationTsv.map(function(v) {
		v.population=parseInt(v.population_2014_01);
		OpenData.population['ccaas'][v.code]=v;
	});
}
OpenData.loadAvailableMetrics = function() {
	return fetchyaml(apibase + '/discover/metrics')
		.then(result => {
			OpenData.metrics = {};
			OpenData.metricdata = {};
			return Promise.all(result.metrics.map(o => {
				OpenData.metrics[o.id] = o.text;
				OpenData.metrics[o.id + '_change'] = _('Incremento de ') + o.text;
				OpenData.metrics[o.id + '_per1M'] = o.text + _(' por millón de habitantes');
				return fetchyaml(apibase + '/'+ o.id + '/by/ccaa/monthly?country=ES')
					.then(metricdata => {
						console.log("Loaded data from", o.id)
						// Api returns dates as strings, turn them dates
						metricdata.dates = metricdata.dates.map(function(d) { return new Date(d);})
						Object.keys(metricdata.countries).map(function(countryCode) {
							appendPool(o.id, metricdata.countries, countryCode, 'ccaas');
						})
						OpenData.metricdata[o.id] = metricdata;
						return metricdata;
					})
			}))
		})
		.then(metricsData => {
			OpenData.metricExtents = {};
			Object.keys(OpenData.metrics).map(function(metric) {
				var values = Object.keys(OpenData.pools.ccaas).map(function(ccaa) {
					return d3.extent(OpenData.pools.ccaas[ccaa][metric] || []);
				})
				OpenData.metricExtents[metric] = d3.extent(d3.merge(values));
			});
			OpenData.selectedPool = Object.keys(OpenData.pools.ccaas).map(function (k) { return OpenData.pools.ccaas[k]; });
			console.log("initializing axis");
			GapMinder.Example.xmetric = 'members';
			GapMinder.Example.ymetric = 'contracts';
			GapMinder.Example.rmetric = 'members_change';
			GapMinder.Example.api.setX('members');
			GapMinder.Example.api.setY('contracts');
			GapMinder.Example.api.setR('members_change');
			GapMinder.Example.api.resetTimeAxis();
			GapMinder.Example.api.replay();
			m.redraw();
		})
}

OpenData.dates = function() {
	if (OpenData.metricdata && OpenData.metricdata.contracts) {
		return OpenData.metricdata.contracts.dates;
	}
	return [
		new Date("2010-01-01"),
		new Date("2010-02-01"),
		new Date("2010-03-01"),
	];
}

function appendPool(metric, context, parentCode, level) {

	function diff(array) {
		var previous = 0;
		return array.map(function (v) {
			var result = v - previous;
			previous = v;
			return result;
		});
	}

	if (context===undefined) return;
	var children = context[parentCode][level];
	if (OpenData.pools[level] === undefined) {
		OpenData.pools[level] = {};
	}
	Object.keys(children).map(function(code) {
		var child = children[code];
		var childTarget = OpenData.pools[level][code];
		if (!childTarget) {
			childTarget = OpenData.pools[level][code] = {
				parent: parentCode,
				code: code,
				name: child.name,
			};
			if (OpenData.population[level] !== undefined) {
				childTarget.population = OpenData.population[level][code]!==undefined ?
						OpenData.population[level][code].population:
						OpenData.population[level]['00'].population;
			}
		}
		childTarget[metric] = child.values;
		childTarget[metric+'_change'] = diff(child.values);
		var population = childTarget.population;
		if (population) {
			childTarget[metric+'_per1M'] = child.values.map(function(v) {
				return 1000000*v/population;
			});
		}
		appendPool(metric, child.states, code, 'states');
	});
}

OpenData.metricText = function(metric) {
	return OpenData.metrics[metric];
};
OpenData.metricOptions = function(selected) {
	return Object.keys(OpenData.metrics).map(function(key) {
		return {
			value: key,
			text: OpenData.metricText(key),
			selected: key === selected,
		};
	});
};
OpenData.interpolateDate = function(date) {
	var i = d3.bisectLeft(OpenData.dates(), date, 0, OpenData.dates().length - 1);
	var factor = i>0?
		(date - OpenData.dates()[i]) / (OpenData.dates()[i-1] - OpenData.dates()[i]):
		0;
	return OpenData.selectedPool.map(function(object) {
		function interpolate(source) {
			if (i===0) return source[i];
			return source[i] * (1-factor) + source[i-1] * factor;
		}
		function getValue(source) {
			const minimum = 0; // 1 for log, 0 for linear
			if (!source) return minimum;
			var value = interpolate(source);
			if (!value) return minimum;
			return value;
		}
		var interpolated = {
			date: date,
			code: object.code,
			parent: object.parent,
			name: object.name,
		};
		Object.keys(OpenData.metrics).map(function(metric) {
			interpolated[metric] = getValue(object[metric]);
		})
		return interpolated;
	});
};

const GapMinder = {};
GapMinder.oninit = function(vn) {
	var self = this;
	// Exposed api
	self.api = vn.attrs.api || {};
	self.api.play = function() { self.play && self.play(); };
	self.api.replay = function() { self.replay && self.replay(); };
	self.api.pause = function() { self.pause && self.pause(); };
	self.api.setXLinear = function() { self.setXLinear && self.setXLinear(); };
	self.api.setXLog = function() { self.setXLog && self.setXLog(); };
	self.api.setYLinear = function() { self.setYLinear && self.setYLinear(); };
	self.api.setYLog = function() { self.setYLog && self.setYLog(); };
	self.api.setX = function(metric) { self.setXMetric(metric); };
	self.api.setY = function(metric) { self.setYMetric(metric); };
	self.api.setR = function(metric) { self.setRMetric(metric); };
	self.api.resetTimeAxis = function() { self.resetTimeAxis(); }
	self.parameters = {
		x: 'members',
		y: 'contracts',
		r: 'members_change',
		color: 'code',
//		key: 'parent',
		key: 'code',
		name: 'name',
	};
};

OpenData.loadRelativeMetrics();
OpenData.loadAvailableMetrics()

GapMinder.oncreate = function(vn) {
	var self = this;
	// Various accessors that specify the four dimensions of data to visualize.
	function pick(param) {
		return function(d) {
			return d[self.parameters[param]];
		};
	}
	var x = pick('x');
	var y = pick('y');
	var radius = pick('r');
	var color = pick('color');
	var key = pick('key');
	var name = pick('name');

	self.width = vn.dom.offsetWidth;
	self.height = vn.dom.offsetHeight;

	// Chart dimensions.
	var margin = {top: 19.5, right: 19.5, bottom: 19.5, left: 39.5};
	var width = self.width - margin.right - margin.left;
	var height = self.height - margin.top - margin.bottom;

	// Various scales. These domains make assumptions of data, naturally.
	var xScaleLog = d3.scaleLog()
		.domain([1,200000])
		.range([10, width])
		.clamp(true)
		;
	var xScaleLinear = d3.scaleLinear()
		.domain([0,200000])
		.range([10, width])
		.clamp(true)
		;
	self.xScale = xScaleLog;

	var yScaleLog = d3.scaleLog()
		.domain([1,200000])
		.range([height, 10])
		.clamp(true)
		;
	var yScaleLinear = d3.scaleLinear()
		.domain([0,200000])
		.range([height, 10])
		.clamp(true)
		;
	self.yScale = yScaleLog;

	var radiusScale = d3.scaleSqrt()
		.domain([1,200000])
		.range([5, 200])
		;
	var colorScale = d3.scaleOrdinal(d3.schemeAccent);


	// The x & y axes.
	var xAxis = d3.axisBottom()
		.scale(self.xScale)
		.ticks(22, d3.format(".0s"))
		;
	var yAxis = d3.axisLeft()
		.scale(self.yScale)
		.ticks(22, d3.format('.0s'))
		;

	var axisLabelMargin = 6;

	// Create the SVG container and set the origin.
	var svg = d3.select(vn.dom).append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.attr("preserveAspectRatio", 'xMidYMin meet')
		;
	var view = svg.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	// Add the x-axis.
	view.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(xAxis);

	// Add the y-axis.
	view.append("g")
		.attr("class", "y axis")
		.call(yAxis);

	// Add an x-axis label.
	self.xLabel = view.append("text")
		.attr("class", "x label")
		.attr("text-anchor", "end")
		.attr("x", width)
		.attr("y", height - axisLabelMargin)
		.text(OpenData.metricText(self.parameters.x));

	// Add a y-axis label.
	self.yLabel = view.append("text")
		.attr("class", "y label")
		.attr("text-anchor", "end")
		.attr("y", axisLabelMargin)
		.attr("x", "-1em")
		.attr("dy", ".75em")
		.attr("transform", "rotate(-90)")
		.text(OpenData.metricText(self.parameters.y));

	// Add grids
	var xGridAxis = d3.axisBottom()
		.scale(xScaleLog)
		.ticks(22, d3.format(".0s"))
		.tickSize(-height, 0, 0)
		.tickFormat("")
		;
	var xGridAxisLinear = d3.axisBottom()
		.scale(xScaleLinear)
		.ticks(22, d3.format(".0s"))
		.tickSize(-height, 0, 0)
		.tickFormat("")
		;
	var yGridAxis = d3.axisLeft()
		.scale(self.yScale)
		.ticks(22, d3.format('.0s'))
		.tickSize(-width, 0, 0)
		.tickFormat("")
		;
	view.append("g")
		.attr("class", "grid x")
		.attr("transform", "translate(0," + height + ")")
		.call(xGridAxis)
		;
	view.append("g")
		.attr("class", "grid y")
		.call(yGridAxis)
		;

	view.selectAll('.axis.y').on('click', function() {
		if (self.yScale === yScaleLog)
			self.setYLinear();
		else
			self.setYLog();
	});
	view.selectAll('.axis.x').on('click', function() {
		if (self.xScale === xScaleLog)
			self.setXLinear();
		else
			self.setXLog();
	});

	view.append('line')
		.attr('y2',0)
		.attr('x2',0)
		.attr('y1',10)
		.attr('x1',10)
		.style('stroke', 'red')
		;
	var timePoint = view.append('line');

	// Add the date label; the value is set on transition.
	var dateLabel = view.append("text")
		.attr("class", "date label")
		.attr("text-anchor", "start")
		.attr("y", 0)
		.attr("x", 24)
		.text('0000-00')
		;

	var dateBox = dateLabel.node().getBBox();
	dateLabel.attr("y", dateBox.height-32);
	dateBox = dateLabel.node().getBBox();

	self.timeBounds = d3.extent(OpenData.dates());
	self.dateScale = d3.scaleTime()
		.domain(self.timeBounds)
		.range([dateBox.x + 10, dateBox.x + dateBox.width - 10])
		.clamp(true)
		;

	var dateAxis = d3.axisBottom()
		.scale(self.dateScale)
		;
	// Add the date-axis.
	view.append("g")
		.attr("class", "time axis")
		.attr("transform", "translate(0," + 10 + ")")
		.call(dateAxis);

	timePoint
		.attr('class', 'timepointer')
		.attr('x1', self.dateScale(self.currentDate))
		.attr('x2', self.dateScale(self.currentDate))
		.attr('y1', dateBox.y)
		.attr('y2', dateBox.y+dateBox.height)
		.style('stroke', 'red')
		;

	var currentInfo = view.append('foreignObject')
		.attr('class', 'currentInfo')
		.attr('x', width-200)
		.attr('y', height-56)
		.attr('width', '20em')
		.attr('height', height/3)
		;
	currentInfo.append('xhtml:div')
		.attr('class', 'currentInfoContent')
		;

	self.setXMetric = function(metric) {
		self.parameters.x = metric;
		self.xLabel.text(OpenData.metricText(metric));
		xScaleLog.domain([1,OpenData.metricExtents[metric][1]]);
		xScaleLinear.domain(OpenData.metricExtents[metric]);
		resetXAxis(self.xScale);
	};
	self.setYMetric = function(metric) {
		self.parameters.y = metric;
		self.yLabel.text(OpenData.metricText(metric));
		yScaleLog.domain([1,OpenData.metricExtents[metric][1]]);
		yScaleLinear.domain(OpenData.metricExtents[metric]);
		resetYAxis(self.yScale);
	};
	self.setRMetric = function(metric) {
		self.parameters.r = metric;
		displayDate(self.currentDate);
	};
	self.setYLinear = function() {
		resetYAxis(yScaleLinear);
	};
	self.setYLog = function() {
		resetYAxis(yScaleLog);
	};
	self.setXLinear = function() {
		resetXAxis(xScaleLinear);
	};
	self.setXLog = function() {
		resetXAxis(xScaleLog);
	};
	self.resetTimeAxis = function() {
		resetTimeAxis();
	}
	function resetXAxis(scale) {
		self.xScale = scale;
		xGridAxis.scale(self.xScale);
		xAxis.scale(self.xScale);
		d3.select(".axis.x")
			.transition()
			.call(xAxis)
			;
		d3.select(".grid.x")
			.transition()
			.call(xGridAxis)
			;
		displayDate(self.currentDate);
	}
	function resetYAxis(scale) {
		self.yScale = scale;
		yGridAxis.scale(self.yScale);
		yAxis.scale(self.yScale);
		d3.select(".axis.y")
			.transition()
			.call(yAxis)
			;
		d3.select(".grid.y")
			.transition()
			.call(yGridAxis)
			;
		displayDate(self.currentDate);
	}
	function resetTimeAxis(scale) {
		self.pause();
		self.timeBounds = d3.extent(OpenData.dates());
		console.log("resetTimeAxis", self.timeBounds[0]);
		self.dateScale.domain(self.timeBounds);
		dateAxis.scale(self.dateScale);
		// Add the date-axis.
		d3.select(".time.axis")
			.call(dateAxis);
		displayDate(self.timeBounds[0]);
	}
	// Positions the dots based on data.
	function position(dot) {
		dot
			.attr("cx", function(d) { return self.xScale(x(d)); })
			.attr("cy", function(d) { return self.yScale(y(d)); })
			.attr("r", function(d) { return radiusScale(radius(d)); })
			;
	}

	// Defines a sort order so that the smallest dots are drawn on top.
	function order(a, b) {
		return radius(b) - radius(a);
	}
	// Add a dot per nation. Initialize the data at 1800, and set the colors.
	var dots = view.append("g")
		.attr("class", "dots")
	;

	function hideCurrentDot(data) {
		currentInfo.style('display', 'none');
	}
	function showCurrentDot(data) {
		const cursorSize = 20;
		const infoWidth = 300; // TODO: Should be 20em as the css .currentInfo width
		const infoHeight = 120; // TODO: Should be ...whatever it is
		currentInfo.style('display', 'block');
		var coordinates = d3.mouse(this);
		var x = coordinates[0]+20;
		if (x+infoWidth>width) {
			x = width - infoWidth;
		}
		var y = coordinates[1]+20;
		if (y+infoHeight>height)
			y = height - infoHeight;
		currentInfo
			.attr('x', x)
			.attr('y', y)
			;
		// TODO: Bisect instead of interpolate
		currentInfo.select('.currentInfoContent').html(
			"<div>"+
			"<span class='colorbox' style='background: "+
			colorScale(data.code)+";'></span>"+
			data.name+
			"</div>"+
			"<div><b>"+_("Mes:")+"</b> "+
			self.currentDate.toISOString().slice(0,7)+
			"</div>"+
			"<div><b>"+OpenData.metricText(self.parameters.x)+":</b> "+
			Math.round(data[self.parameters.x])+
			"</div>"+
			"<div><b>"+OpenData.metricText(self.parameters.y)+":</b> "+
			Math.round(data[self.parameters.y])+
			"</div>"+
			"<div><b>"+OpenData.metricText(self.parameters.r)+":</b> "+
			Math.round(data[self.parameters.r])+
			"</div>"+
			""
		);
	}

	// Updates the display to show the specified date.
	function displayDate(date) {
		self.currentDate=date;
		var dot = dots
			.selectAll(".dot")
			.data(interpolateData(date), key)
		;
		dot
			.enter().append("circle")
				.attr("class", "dot")
				.style("fill", d => colorScale(color(d)))
				.on('mouseover', showCurrentDot)
				.on('mousemove', showCurrentDot)
				.on('mouseout', hideCurrentDot)
		;
		dot
			.exit().remove()
		;
		dots
			.selectAll(".dot")
			.data(interpolateData(date), key)
			.call(position)
			.sort(order)
		;
		var dateText = date? date.toISOString().slice(0,7):'0000-00-00';
		dateLabel.text(dateText);
		timePoint
			.attr('x1', self.dateScale(self.currentDate))
			.attr('x2', self.dateScale(self.currentDate))
			;

	}

	// Interpolates the dataset for the given date.
	function interpolateData(date) {
		return OpenData.interpolateDate(date);
	}
	self.loadData = function() {

		// Add an overlay for the date label.
		var dateBox = dateLabel.node().getBBox();

		var overlay = view.append("rect")
			.attr("class", "overlay")
			.attr("x", dateBox.x)
			.attr("y", dateBox.y)
			.attr("width", dateBox.width)
			.attr("height", dateBox.height)
			.on("mouseover", dragDate);

		// Start a transition that interpolates the data based on date.
		self.replay = function() {
			self.pause();
			displayDate(self.timeBounds[0]);
			self.play();
		};
		self.play = function() {
			self.pause();
			var remainingFactor = (self.timeBounds[1]-self.currentDate)/(
				self.timeBounds[1]-self.timeBounds[0]);
			view.transition()
				.ease(d3.easeLinear)
				.tween("dateplay", function() {
					var date = d3.interpolateDate(self.currentDate, self.timeBounds[1]);
					return function(t) { displayDate(date(t)); };
				})
				.on("end", self.replay)
				.duration(60000*remainingFactor)
			;
			overlay.on("mouseover", dragDate);
		};
		self.pause = function() {
			console.log("Paused at", self.currentDate);
			view.transition().duration(0);
		};

		// After the transition finishes, you can mouseover to change the date.
		function dragDate() {
			// Cancel the current transition, if any.
			self.pause();

			overlay
				.on("mouseover", mouseover)
				.on("mouseout", mouseout)
				.on("mousemove", mousemove)
				.on("touchmove", mousemove);

			function mouseover() {
				dateLabel.classed("active", true);
			}

			function mouseout() {
				dateLabel.classed("active", false);
			}

			function mousemove() {
				displayDate(self.dateScale.invert(d3.mouse(this)[0]));
			}
		}
	};
	self.loadData();
	self.replay();
};

GapMinder.view = function(vn) {
	return m('.gapminder', vn.attrs);
};

const Select = require('./mdc/select');
const Button = require('./mdc/button');
const Layout = require('./mdc/layout');
const Row = Layout.Row;
const Cell = Layout.Cell;

GapMinder.Example = {};
GapMinder.Example.api = {};
GapMinder.Example.xmetric = '';
GapMinder.Example.ymetric = '';
GapMinder.Example.rmetric = '';
GapMinder.Example.view = function(vn) {
	return m(Layout, [
		m(Row, m(Cell, {span: 12}, m(GapMinder, {
			api: GapMinder.Example.api,
			xmetric: GapMinder.Example.xmetric,
			ymetric: GapMinder.Example.ymetric,
			rmetric: GapMinder.Example.rmetric,
			style: {
				height: '750px',
			},
		}))),
		m(Row, [
			m(Cell, {span: 3},
				m(Button, {
					faicon: 'play',
					outlined: true,
					style: {width: '50%'},
					onclick: function() { GapMinder.Example.api.play();},
				},_('Play')),
				m(Button, {
					faicon: 'pause',
					outlined: true,
					style: {width: '50%'},
					onclick: function() { GapMinder.Example.api.pause();},
				},_('Pause')),
			),
			m(Cell, {span: 3}, m(Select, {
				label: _('Eje X'),
				options: OpenData.metricOptions(GapMinder.Example.xmetric),
				required: true,
				value: GapMinder.Example.xmetric,
				onchange: function(ev) {
					var metric = ev.target.value;
					GapMinder.Example.xmetric = metric;
					GapMinder.Example.api.setX(metric);
				},
			})),
			m(Cell, {span: 3}, m(Select, {
				label: _('Eje Y'),
				options: OpenData.metricOptions(GapMinder.Example.ymetric),
				required: true,
				value: GapMinder.Example.ymetric,
				onchange: function(ev) {
					var metric = ev.target.value;
					GapMinder.Example.ymetric = metric;
					GapMinder.Example.api.setY(metric);
				},
			})),
			m(Cell, {span: 3}, m(Select, {
				label: _('Radio'),
				options: OpenData.metricOptions(GapMinder.Example.rmetric),
				required: true,
				value: GapMinder.Example.rmetric,
				onchange: function(ev) {
					var metric = ev.target.value;
					GapMinder.Example.rmetric = metric;
					GapMinder.Example.api.setR(metric);
				},
			})),
		]),
	]);
};

var Main = {
	view: function(vn) {
		return m('.form.mdc-typography', [
			m(GapMinder.Example)
		]);
	},
};

window.onload = function() {
	var element = document.getElementById("mithril-target");
	m.mount(element, Main);
};


// vim: noet ts=4 sw=4
