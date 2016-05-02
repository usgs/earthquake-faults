/* global L */
'use strict';


var Util = require('util/Util');


var _DEFAULTS = {
  baseLayers: {
    // 'Layer Name': LayerObject
  },
  overlays: {
    // 'Layer Name': LayerObject
  },
  options: {
    collapsed: true,
    position: 'topright',
    autoZIndex: true
  },
  insertPoint: '2014 Fault Sources'
};


var QFaultLayers = function (options) {
  var _this,
      _initialize,

      _insertPoint;


  options = Util.extend({}, _DEFAULTS, options);
  _this = L.control.layers(options.baseLayers, options.overlays,
      options.options);

  _initialize = function (options) {
    _insertPoint = options.insertPoint;
  };


  _this._addItem = function (obj) {
    var checked,
        container,
        fragment,
        input,
        label;

    fragment = document.createDocumentFragment();
    label = document.createElement('label');
    checked = _this._map.hasLayer(obj.layer);
    input = document.createElement('input');
    input.type = 'radio';
    input.className = 'leaflet-control-layers-selector';
    input.defaultChecked = checked;
    input.name = 'fault-layer';

    input.layerId = L.stamp(obj.layer);
    input.id = 'leaflet-layer-control-selector-' + input.layerId;

    L.DomEvent.on(input, 'click', _this._onInputClick, _this);

    label.innerHTML = obj.name;
    label.setAttribute('for', input.id);

    fragment.appendChild(input);
    fragment.appendChild(label);

    container = obj.overlay ? this._overlaysList : this._baseLayersList;
    container.appendChild(fragment);

    return fragment;
  };

  _this._update = Util.compose(_this._update, function () {
    var title;

    title = document.createElement('h3');
    title.classList.add('hazfault-title');
    title.innerHTML = 'National Seismic Hazard Model';

    _this._overlaysList.insertBefore(title, _this._overlaysList.firstChild);
  });


  _this.addQFault = function (layer, name) {
    return _this.addBaseLayer(layer, name);
  };

  _this.addHazFault = function (layer, name) {
    return _this.addOverlay(layer, name);
  };

  _this.onAdd = Util.compose(_this.onAdd, function (container) {
    container.classList.add('fault-control-layers');

    return container;
  });


  _initialize(options);
  options = null;
  return _this;
};


module.exports = QFaultLayers;
