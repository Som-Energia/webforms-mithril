'use strict';

var uribase = 'http://0.0.0.0:5001/v0.2';
var uribase = 'https://opendata.somenergia.coop/v0.2';


var OpenDataUri = {
	_metric: 'members',
	_geolevel: '',
	_time: 'on',
	_ondate: undefined,
	_fromdate: undefined,
	_todate: undefined,
	_filters: undefined,

	uri: function () {
		var result = uribase+'/'+OpenDataUri._metric;
		result += OpenDataUri._geolevel?'/by/'+OpenDataUri._geolevel:'';

		if (OpenDataUri._time==='on') {
			result+= OpenDataUri._ondate && '/on/'+OpenDataUri._ondate.format('YYYY-MM-DD') || '';
		}
		else {
			result+= '/'+OpenDataUri._time;
			result+= OpenDataUri._fromdate && '/from/'+OpenDataUri._fromdate.format('YYYY-MM-DD') || '';
			result+= OpenDataUri._todate   && '/to/'  +  OpenDataUri._todate.format('YYYY-MM-DD') || '';
		}
		if (OpenDataUri._filters) {
			result+= '?'+OpenDataUri._filters;
		}
		return result;
	},
};


module.export = OpenDataUri;
