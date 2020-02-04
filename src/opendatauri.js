'use strict';
var moment = require('moment')

var uribase = 'http://0.0.0.0:5001/v0.2';
var uribase = 'https://opendata.somenergia.coop/v0.2';

function OpenDataUri() {
    var _responseType = 'data'
	var _metric = 'members';
	var _geolevel = '';
	var _time = 'on';
	var _ondate = undefined;
	var _fromdate = undefined;
	var _todate = undefined;
	var _filters = undefined;
	var _prevUri = undefined;
	var lastChange = [undefined, undefined]; //[previousValue,newValue]

	this.getResponseType = function () {
        return _responseType;
    };
    this.getMetric = function () {
		return _metric;
	};
	this.getGeolevel = function () {
		return _geolevel;
	};
	this.getTime = function() {
		return _time;
	};
	this.getOnDate = function () {
		return _ondate ? moment(_ondate, "YYYY-MM-DD") : _ondate;
	}
	this.getFromDate = function () {
		return _fromdate ? moment(_fromdate, "YYYY-MM-DD") : undefined;
	};
	this.getToDate = function() {
		return _todate ? moment(_todate, "YYYY-MM-DD") : _todate;
	};
	this.getFilters = function () {
		return _filters;
	};
    this.setResponseType = function (value) {
        if (value !== _responseType){
            if (value === 'map'){
                lastChange[0]= '';
                lastChange[1] = '/'+value;
            }
            else {
                lastChange[0]='/map';
                lastChange[1] = '';
            }
            _prevUri = this.uri();
            _responseType = value;
        }
    };
	this.setMetric = function (value) {
		if (value !== _metric){
			lastChange[0]=_metric;
			lastChange[1] = value;
			_prevUri = this.uri();
			_metric = value;
		}
	};
	this.setGeolevel = function(value) {
		if (value !== _geolevel){
			lastChange[0]= value ? _geolevel : '/by/' + _geolevel;
			lastChange[1] = _geolevel ? value : '/by/'+value;
			_prevUri = this.uri();
			_geolevel = value;
		}
	};
	this.setTime = function(value) {
		if (value !== _time){
			var oldValue = _time;
			if (_time !== 'on' && value !== 'on'){
				lastChange[0] = oldValue ? oldValue : '';
				_prevUri = this.uri();
				_time = value;
				lastChange[1] = value ? value : '';
			}
			else {
				lastChange[0] = frequencyAndDates();
			   _prevUri = this.uri();
				_time = value;
				lastChange[1] = frequencyAndDates();
			}
		}
	};
	this.setOnDate = function(value) {
		var formattedValue = value ? value.format('YYYY-MM-DD') : value;
		if (formattedValue !== _ondate){
			lastChange[0]= value ? (_ondate ? _ondate : '') : '/on/' + _ondate;
			lastChange[1] = _ondate ? formattedValue : '/on/'+ formattedValue;
			_prevUri = this.uri();
			_ondate = formattedValue;
		}
	};
	this.setFromDate = function(value) {
		var formattedValue = value ? value.format('YYYY-MM-DD') : value;
		if (formattedValue !== _fromdate){
			lastChange[0]= value ? (_fromdate ? _fromdate : '') : '/from/' + _fromdate;
			lastChange[1] = _fromdate ? formattedValue : '/from/'+ formattedValue;
			_prevUri = this.uri();
			_fromdate = formattedValue;
		}
	};
	this.setToDate = function(value) {
		var formattedValue = value ? value.format('YYYY-MM-DD') : value;
		if (formattedValue !== _todate){
			lastChange[0]= value ? (_todate ? _todate : '') : '/to/' + _todate;
			lastChange[1] = _todate ? formattedValue : '/to/'+ formattedValue;
			_prevUri = this.uri();
			_todate = formattedValue;
		}
	};
	this.setFilters = function(value) {
		lastChange[0] = value ? '' : '?' + _filters;
		lastChange[1] = value ? '?'+value : '';
		_prevUri = this.uri();
		_filters = value;
	};
	this.uri = function () {
		var result = uribase
        result+= _responseType==='map'? '/map' :'';
        result+='/'+_metric;
		result += _geolevel?'/by/'+_geolevel:'';

		result+= frequencyAndDates();
		if (_filters) {
			result+= '?'+_filters;
		}
		return result;
	};

	this.highlightedUri = function() {
		var uri = this.uri();
		var fragments = [];
		var result = [];
		if (_prevUri == undefined) {
				return [['K', uri]];
		}
		else {
			if (lastChange[1] === undefined || lastChange[1] === '' ){
				fragments = _prevUri.split(lastChange[0]);
				result.push(['K', fragments[0]]);
				result.push(['I', '']);
			}
			else {
				if (uri.indexOf(lastChange[1]) !== uri.lastIndexOf(lastChange[1])){
					fragments = _prevUri.split(lastChange[0]);
				}
				else {
					fragments = uri.split(lastChange[1]);
				}
				result.push(['K', fragments[0]]);
				result.push(['I', lastChange[1]]);
			}
			result.push(['O', lastChange[0]]);
			if (fragments.length >1 && fragments[1].length>0){
				result.push(['K', fragments[1]]);
			}
			return result;
		}
	};
	function frequencyAndDates() {
		var result = '';
		if (_time==='on') {
			result+= _ondate && '/on/'+_ondate || '';
		}
		else {
			result+= '/'+_time;
			result+= _fromdate && '/from/'+_fromdate || '';
			result+= _todate   && '/to/'  +  _todate || '';
		}
		return result;
	}
}


module.exports = OpenDataUri;
