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
	'QFaultMap'
], function (
	QFaultMap
) {
	'use strict';

	var GEO = 'http://geohazards.usgs.gov/ArcGIS/rest/services';

	new QFaultMap({
		faultLayerUrl: GEO + '/qfaults2013/MapServer/tile/{z}/{y}/{x}',
		faultLayerOpts: {
			attribution: '<a href="/hazards/qfaults/">USGS</a>'
		},
		faultInfoUrl: GEO + '/qfaults2013/MapServer/identify',

		paleoLayerUrl: GEO + '/paleosites2013/MapServer/tile/{z}/{y}/{x}',
		paleoInfoUrl: GEO + '/paleosites2013/MapServer/identify'
	});
});