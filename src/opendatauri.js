'use strict';

var uribase = 'http://0.0.0.0:5001/v0.2';
var uribase = 'https://opendata.somenergia.coop/v0.2';

function OpenDataUri() {
	var _metric = 'members';
	var _geolevel = '';
	var _time = 'on';
	var _ondate = undefined;
	var _fromdate = undefined;
	var _todate = undefined;
	var _filters = undefined;
    var _prevValue = undefined;
    var _prevUri = undefined;
    var lastChange = [undefined, undefined]; //[previousValue,newValue]

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
        return _ondate;
    }
    this.getFromDate = function () {
        return _fromdate;
    };
    this.getToDate = function() {
        return _todate;
    };
    this.getFilters = function () {
        return _filters;
    };
    this.setMetric = function (value) {
        lastChange[0]=_metric;
        lastChange[1] = value;
        _prevUri = this.uri();
        _metric = value;
    };
    this.setGeolevel = function(value) {
        lastChange[0]= value ? _geolevel : '/by/' + _geolevel;
        lastChange[1] = _geolevel ? value : '/by/'+value;
        _prevUri = this.uri();
        _geolevel = value;
    };
    this.setTime = function(value) {
        if (_time === 'on'){
            lastChange[0] = _ondate ? '/on/'+_ondate.format('YYYY-MM-DD') : '';
        }
        lastChange[0] = '/'+_time;
        if (value === 'on'){
            lastChange[1] = _ondate ? '/on/'+_ondate.format('YYYY-MM-DD') : '';
        }
        else {lastChange[1] = '/'+value;}
        _prevUri = this.uri();
        _time = value;
    };
    this.setOnDate = function(value) {
        lastChange[0]= value ? _ondate : '/on/' + _ondate;
        lastChange[1] = _ondate ? value : '/on/'+value;
        _prevUri = this.uri();
        _ondate = value;
    };
    this.setFromDate = function(value) {
        _prevUri = this.uri();
        _fromdate = value;
    };
    this.setToDate = function(value) {
        _todate = value;
    };  
    this.setFilters = function(value) {
        _prevUri = this.uri();
        _filters = value;
    };
	this.uri = function () {
		var result = uribase+'/'+_metric;
		result += _geolevel?'/by/'+_geolevel:'';

		if (_time==='on') {
			result+= _ondate && '/on/'+_ondate.format('YYYY-MM-DD') || '';
		}
		else {
			result+= '/'+_time;
			result+= _fromdate && '/from/'+_fromdate.format('YYYY-MM-DD') || '';
			result+= _todate   && '/to/'  +  _todate.format('YYYY-MM-DD') || '';
		}
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
                console.log("he entrat frabmento" + _prevUri + " per " + lastChange[0] + "")
                fragments = _prevUri.split(lastChange[0]);
                result.push(['K', fragments[0]]);
                result.push(['I', '']);
            }
            else {
                console.log("noo he entrat")
                console.log("he entrat frabmento" + uri+" per " + lastChange[1] + "")
                fragments = uri.split(lastChange[1]);
                result.push(['K', fragments[0]]);
                result.push(['I', lastChange[1]]);
            }
        console.log("fragments: "+ fragments)
            result.push(['O', lastChange[0]]);
        console.log("lastChange: "+ lastChange[0] +" , " + lastChange[1]);
            if (fragments.length >1 && fragments[1].length>0){
                result.push(['K', fragments[1]]);
            }
            console.log("Ara tinc "+ result);
            return result;
        }
    };
}


module.exports = OpenDataUri;
