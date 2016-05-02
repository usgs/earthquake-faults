/* global L */
'use strict';


var HazardFault = require('leaflet/layer/HazardFault'),
    Legend = require('control/Legend'),
    Util = require('util/Util');


var _DEFAULTS = {
  // URL to legend image
  imageUrl: '/images/legend.png',

  // URL to download shapefile bundle
  shapefileUrl: '/etc/shapefile.zip',

  title: 'Custom',

  // URL to service base, should provide 'MapServer' and 'Identify' endpoints
  url: '/arcgis/rest/services/faults'
};


var FaultLayer = function (options) {
  var _this,
      _initialize,

      _download,
      _legend,
      _title,
      _url;

  options = Util.extend({}, _DEFAULTS, options);
  _this = L.layerGroup();

  _initialize = function (options) {
    _download = options.download;
    _legend = options.legend;
    _title = options.title;
    _url = options.url;

    _this.addLayer(new HazardFault({
      clickable: true,
      url: _url
    }));

    _this.addLayer(Legend({
      download: _download,
      legend: _legend,
      title: _title
    }));
  };

  _this.addLayerOrControl = function (layer) {
    if (_this.isControl(layer)) {
      _this._map.addControl(layer);
    } else {
      _this._map.addLayer(layer);
    }
  };

  _this.getTitle = function () {
    return _title;
  };

  _this.isControl = function (layer) {
    return layer instanceof L.Control;
  };

  _this.onAdd = function (map) {
    this._map = map;
    this.eachLayer(_this.addLayerOrControl, _this);
  };

  _this.onRemove = function (/*map*/) {
    this._map.closePopup();
    this.eachLayer(_this.removeLayerOrControl, _this);
    this._map = null;
  };

  _this.removeLayerOrControl = function (layer) {
    if (_this.isControl(layer)) {
      _this._map.removeControl(layer);
    } else {
      _this._map.removeLayer(layer);
    }
  };

  _initialize(options);
  options = null;
  return _this;
};


L.faultLayer = FaultLayer;


module.exports = FaultLayer;
