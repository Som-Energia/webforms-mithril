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
