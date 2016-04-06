'use strict';

var FaultApp = require('FaultApp');


FaultApp({
  el: document.querySelector('.earthquake-faults-app')
});

// require.config({
//   base: 'js',
//   paths: {
//     leaflet: '../leaflet/leaflet-src'
//   },
//   shim: {
//     leaflet: {
//       exports: 'L'
//     }
//   }
// });

// require([
//   'QFaultMap'
// ], function (
//   QFaultMap
// ) {
//   'use strict';

//   var GEO = 'http://earthquake.usgs.gov/arcgis/rest/services';

//   new QFaultMap({
//     faultLayerUrl: GEO + '/haz/qfaults/MapServer/tile/{z}/{y}/{x}',
//     faultLayerOpts: {
//       attribution: '<a href="/hazards/qfaults/">USGS</a>'
//     },
//     faultInfoUrl: GEO + '/haz/qfaults/MapServer/identify',

//     paleoLayerUrl: GEO + '/haz/paleosites/MapServer/tile/{z}/{y}/{x}',
//     paleoInfoUrl: GEO + '/haz/paleosites/MapServer/identify'
//   });
// });
