/* global L */
'use strict';


var EsriTerrain = require('leaflet/layer/EsriTerrain'),
    FaultLayer = require('layer/FaultLayer'),
    HazDevLayers = require('leaflet/control/HazDevLayers'),
    MousePosition = require('leaflet/control/MousePosition'),
    QFaultLayer = require('layer/QFaultLayer'),
    Util = require('util/Util'),
    View = require('mvc/View');


var _DEFAULTS,
    _HAZFAULT_2002_LAYER,
    _HAZFAULT_2008_LAYER,
    _HAZFAULT_2014_LAYER,
    _QFAULT_LAYER;

_DEFAULTS = {

};

_HAZFAULT_2014_LAYER = 'hazfaults2014';
_HAZFAULT_2008_LAYER = 'hazfaults2008';
_HAZFAULT_2002_LAYER = 'hazfaults2002';
_QFAULT_LAYER = 'qfaults';


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
      _scaleControl,
      _zoomControl;


  options = Util.extend({}, _DEFAULTS, options);
  _this = View(options);

  _initialize = function (options) {
    _map = L.map(_this.el, {
      center: [37.3, -95],
      layers:  [EsriTerrain()],
      maxZoom: 11,
      minZoom: 1,
      zoom: 3,
      zoomAnimation: true,
      zoomControl: false
    });

    _zoomControl = L.control.zoom();
    _map.addControl(_zoomControl);

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

    _map.on('zoomend', function () { console.log(_map.getMaxZoom()); });
    _map.on('layeradd', _this.onLayerAdd, _this);
    _this.setActiveLayer(options.layer);
  };


  _this.destroy = Util.compose(function () {
    _map.remove(); // Destroy map and unbind all event listeners

    _hazFault2002 = null;
    _hazFault2008 = null;
    _hazFault2014 = null;
    _layersControl = null;
    _map = null;
    _positionControl = null;
    _qFault = null;
    _scaleControl = null;
    _zoomControl = null;

    _initialize = null;
    _this = null;
  }, _this.destroy);

  _this.onLayerAdd = function (evt) {
    var layer;

    layer = evt.layer;

    if (layer === _qFault) {
      _this.setHash(_QFAULT_LAYER);

      if (_map.getZoom() > 10) {
        _map.setZoom(10);
      }
      _map.options.maxZoom = 10;
    } else if (layer === _hazFault2014) {
      _this.setHash(_HAZFAULT_2014_LAYER);
      _map.options.maxZoom = 11;
    } else if (layer === _hazFault2008) {
      _this.setHash(_HAZFAULT_2008_LAYER);
      _map.options.maxZoom = 11;
    } else if (layer === _hazFault2002) {
      _this.setHash(_HAZFAULT_2002_LAYER);
      _map.options.maxZoom = 11;
    }

    _zoomControl._updateDisabled();
  };

  _this.setActiveLayer = function (layerName) {
    // Remove all layers
    if (_map.hasLayer(_qFault)) { _map.removeLayer(_qFault); }
    if (_map.hasLayer(_hazFault2014)) { _map.removeLayer(_hazFault2014); }
    if (_map.hasLayer(_hazFault2008)) { _map.removeLayer(_hazFault2008); }
    if (_map.hasLayer(_hazFault2002)) { _map.removeLayer(_hazFault2002); }

    // Add layer that is active
    if (layerName === _QFAULT_LAYER) {
      _map.addLayer(_qFault);
    } else if (layerName === _HAZFAULT_2014_LAYER) {
      _map.addLayer(_hazFault2014);
    } else if (layerName === _HAZFAULT_2008_LAYER) {
      _map.addLayer(_hazFault2008);
    } else if (layerName === _HAZFAULT_2002_LAYER) {
      _map.addLayer(_hazFault2002);
    }
  };

  _this.setHash = function (hash) {
    try {
      // better to replace since not listening for hash change events, thus
      // a "back" button click that changes the hash but does not update the
      // interface can lead to inconsistent display
      window.location.replace('#' + hash);
    } catch (e) {
      window.location.hash = hash;
    }
  };


  _initialize(options);
  options = null;
  return _this;
};


FaultApp.HAZFAULT_2002_LAYER = _HAZFAULT_2002_LAYER;
FaultApp.HAZFAULT_2008_LAYER = _HAZFAULT_2008_LAYER;
FaultApp.HAZFAULT_2014_LAYER = _HAZFAULT_2014_LAYER;
FaultApp.QFAULT_LAYER = _QFAULT_LAYER;


module.exports = FaultApp;
