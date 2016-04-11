/* global L */
'use strict';


var EsriTerrain = require('leaflet/layer/EsriTerrain'),
    FaultLayer = require('layer/FaultLayer'),
    HazDevLayers = require('leaflet/control/HazDevLayers'),
    MousePosition = require('leaflet/control/MousePosition'),
    QFaultLayer = require('layer/QFaultLayer'),
    Util = require('util/Util'),
    View = require('mvc/View');


var _DEFAULTS = {

};


var FaultApp = function (options) {
  var _this,
      _initialize,

      _hazFault2002,
      _hazFault2008,
      _hazFault2014,
      _layersControl,
      _map,
      _positionControl,
      _qFault,
      _scaleControl;


  options = Util.extend({}, _DEFAULTS, options);
  _this = View(options);

  _initialize = function (/*options*/) {
    _map = L.map(_this.el, {
      center: [37.3, -95],
      layers:  [EsriTerrain()],
      maxZoom: 11,
      minZoom: 1,
      zoom: 3,
      zoomAnimation: true
    });

    _layersControl = HazDevLayers();
    _map.addControl(_layersControl);

    if (!Util.isMobile()) {
      _positionControl = MousePosition();
      _map.addControl(_positionControl);

      _scaleControl = L.control.scale({position: 'bottomleft'});
      _map.addControl(_scaleControl);
    }

    _qFault = QFaultLayer({
      download: '/hazards/qfaults/qfaults.zip',
      legend: 'images/qfault-legend.png',
      services: {
        'http://earthquake.usgs.gov/arcgis/rest/services/haz/qfaults': {
          minZoom: 0,
          maxZoom: 10
        },
        'http://earthquake.usgs.gov/arcgis/rest/services/haz/paleosites': {
          minZoom: 8,
          maxZoom: 10
        }
      },
      title: 'Quaternary Faults (Age)'
    });
    _layersControl.addBaseLayer(_qFault, _qFault.getTitle());

    _hazFault2014 = FaultLayer({
      download: '/hazards/products/conterminous/2014/data/hazfaults2014.zip',
      legend: 'images/hazfault-legend-2014.png',
      title: '2014 Fault Sources',
      url: 'http://earthquake.usgs.gov/arcgis/rest/services/haz/hazfaults2014'
    });
    _layersControl.addBaseLayer(_hazFault2014, _hazFault2014.getTitle());

    _hazFault2008 = FaultLayer({
      download: '/hazards/products/conterminous/2008/data/hazfaults2008.zip',
      legend: 'images/hazfault-legend.png',
      title: '2008 Fault Sources',
      url: 'http://earthquake.usgs.gov/arcgis/rest/services/haz/hazfaults2008'
    });
    _layersControl.addBaseLayer(_hazFault2008, _hazFault2008.getTitle());

    _hazFault2002 = FaultLayer({
      download: '/hazards/products/conterminous/2002/data/hazfaults2002.zip',
      legend: 'images/hazfault-legend.png',
      title: '2002 Fault Sources',
      url: 'http://earthquake.usgs.gov/arcgis/rest/services/haz/hazfaults2002'
    });
    _layersControl.addBaseLayer(_hazFault2002, _hazFault2002.getTitle());

    _map.addLayer(_qFault);
  };


  _initialize(options);
  options = null;
  return _this;
};


module.exports = FaultApp;
