'use strict';

var uribase = 'http://0.0.0.0:5001/v0.2';
var uribase = 'https://opendata.somenergia.coop/v0.2';

function OpenDataUri() {
	this._metric = 'members';
	this._geolevel = '';
	this._time = 'on';
	this._ondate = undefined;
	this._fromdate = undefined;
	this._todate = undefined;
	this._filters = undefined;

    this.getMetric = function () {
        return this._metric;
    };
    this.getGeolevel = function () {
        return this._geolevel;
    };
    this.getTime = function() {
        return this._time;
    };
    this.getOnDate = function () {
        return this._ondate;
    }
    this.getFromDate = function () {
        return this._fromdate;
    };
    this.getToDate = function() {
        return this._todate;
    };
    this.getFilters = function () {
        return this._filters;
    };
    this.setMetric = function (value) {
        this._metric = value;
    };
    this.setGeolevel = function(value) {
        this._geolevel = value;
    };
    this.setTime = function(value) {
        this._time = value;
    };
    this.setOnDate = function(value) {
        this._ondate = value;
    };
    this.setFromDate = function(value) {
        this._fromdate = value;
    };
    this.setToDate = function(value) {
        this._todate = value;
    };  
    this.setFilters = function(value) {
        this._filters = value;
    };
	this.uri = function () {
		var result = uribase+'/'+this._metric;
		result += this._geolevel?'/by/'+this._geolevel:'';

		if (this._time==='on') {
			result+= this._ondate && '/on/'+this._ondate.format('YYYY-MM-DD') || '';
		}
		else {
			result+= '/'+this._time;
			result+= this._fromdate && '/from/'+this._fromdate.format('YYYY-MM-DD') || '';
			result+= this._todate   && '/to/'  +  this._todate.format('YYYY-MM-DD') || '';
		}
		if (this._filters) {
			result+= '?'+this._filters;
		}
		return result;
	};
    this.highlightedUri = function() {
        return [
            ['K', this.uri()],
        ];
        return [
            ['K', 'hola'],
            ['I', 'padentro'],
            ['O', 'pafuera'],
            ['K', 'hola'],
        ];
    };
}


module.exports = OpenDataUri;
