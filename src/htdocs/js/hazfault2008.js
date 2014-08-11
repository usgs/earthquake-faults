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

	var GEO = 'http://geohazards.usgs.gov/ArcGIS/rest/services';

	new FaultMap({
		faultLayerUrl: GEO + '/hazfaults/MapServer/tile/{z}/{y}/{x}',
		faultLayerOpts: {
			attribution: '<a href="http://pubs.usgs.gov/of/2008/1128/">USGS</a>'
		},
		faultInfoUrl: GEO + '/hazfaults/MapServer/identify'
	});
});
