require.config({
	base: 'js',
	paths: {
		leaflet: '../leaflet/leaflet-src'
	},
	shim: {
		leaflet: {
			exports: 'L'
		}
	}
});

require([
	'FaultMap'
], function (
	FaultMap
) {
	'use strict';

	var GEO = 'http://earthquake.usgs.gov/arcgis/rest/services';

	new FaultMap({
		faultLayerUrl: GEO + '/haz/hazfaults2014/MapServer/tile/{z}/{y}/{x}',
		faultLayerOpts: {
			attribution: '<a href="http://pubs.usgs.gov/of/2014/1091/">USGS</a>'
		},
		faultInfoUrl: GEO + '/haz/hazfaults2014/MapServer/identify'
	});
});
