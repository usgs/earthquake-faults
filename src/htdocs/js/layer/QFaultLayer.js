/* global L */
'use strict';


var ArcIdentify = require('leaflet/ArcIdentify'),
    Legend = require('layer/Legend'),
    TabList = require('tablist/TabList'),
    Util = require('util/Util');


var _DEFAULTS,
    _UNSPECIFIED;

_DEFAULTS = {
  download: '/etc/shakefile.zip',

  legend: '/images/legend.png',

  services: {
    '/argis/rest/services/faults': {},
    '/argis/rest/services/regions': {},
    '/argis/rest/services/paleo': {},
  },

  title: 'Quaternary Faults (Age)',
};

_UNSPECIFIED = '<span class="unknown">unspecified</span>';


var QFaultLayer = function (options) {
  var _this,
      _initialize,

      _popupLatLng,
      _services,
      _tabList,
      _tabListEl,
      _title;


  options = Util.extend({}, _DEFAULTS, options);
  _this = L.layerGroup([]);

  _initialize = function (options) {
    _title = options.title;

    // Legend`
    _this.addLayer(Legend({
      download: options.download,
      legend: options.legend,
      title: _title
    }));

    // Layers and corresponding services
    _services = [];
    Object.keys(options.services).forEach(function (url) {
      _services.push(ArcIdentify({url: url + '/MapServer/identify'}));
      _this.addLayer(L.tileLayer(url + '/MapServer/tile/{z}/{y}/{x}',
          options.services[url]));
    });

    // Other scaffolding
    _tabListEl = document.createElement('div');
    _tabListEl.classList.add('qfault-layer-popup');
  };


  _this.addLayerOrControl = function (layer) {
    if (_this.isControl(layer)) {
      _this._map.addControl(layer);
    } else {
      _this._map.addLayer(layer);
    }
  };

  _this.addTabOutput = function (results) {
    if (!_tabList) {
      _tabList = TabList({
        el: _tabListEl,
        tabs: []
      });
    }

    _tabList.addTab(_this.createTab(results));

    if (_this._map) {
      _this._map.openPopup(_tabListEl, _popupLatLng);
    }
  };

  _this.createTab = function (results) {
    var tab;

    tab = {
      title: results[0].layerName,
      content: _this.createTabContent(results)
    };

    return tab;
  };

  _this.createTabContent = function (results) {
    var content,
        type;

    type = results[0].geometryType;

    if (type === 'esriGeometryPoint') {
      content = _this.createPointContent(results);
    } else if (type === 'esriGeometryPolyline') {
      content = _this.createPolylineContent(results);
    } else if (type === 'esriGeometryPolygon') {
      content = _this.createPolygonContent(results);
    }

    return content;
  };

  _this.createPointContent = function (results) {
    var table;

    table = document.createElement('table');

    table.innerHTML = [
      '<thead>',
        '<tr>',
          '<th scope="col">Site Number</th>',
          '<th scope="col">Trench ID</th>',
        '</tr>',
      '</thead>',
      '<tbody>',
        results.reduce(_this.formatPointRow, []).join(''),
      '</tbody>'
    ].join('');

    return table;
  };

  _this.createPolygonContent = function (results) {
    var table;

    table = document.createElement('table');

    table.innerHTML = [
      '<thead>',
        '<tr>',
          '<th scope="col">Name</th>',
          '<th scope="col">Age</th>',
          '<th scope="col">Slip Rate</th>',
          '<th scope="col">Slip Sense</th>',
        '</tr>',
      '</thead>',
      '<tbody>',
        results.reduce(_this.formatPolygonRow, []).join(''),
      '</tbody>'
    ].join('');

    return table;
  };

  _this.createPolylineContent = function (results) {
    var list;

    list = document.createElement('ul');
    list.classList.add('faults-info');

    list.innerHTML = results.reduce(_this.formatPolylineRow, []).join('');

    return list;
  };

  _this.destroy = Util.compose(function () {
    _this.destroyPopup();
  }, _this.destroy || function () {});

  _this.destroyPopup = function () {
    if (_tabList && _tabList.destroy) {
      _tabList.destroy();
    }

    Util.empty(_tabListEl);
    _tabList = null;
  };

  _this.formatName = function (info) {
    var name;

    if (info.cfm_url && info.name) {
      name = '<a href="' + info.cfm_url + '">' + info.name + '</a>';
    } else if (info.name) {
      name = info.name;
    } else if (info.cfm_url) {
      name = '<a href="' + info.cfm_url + '">' + _UNSPECIFIED + '</a>';
    } else {
      name = _UNSPECIFIED;
    }

    return name;
  };

  _this.formatPointRow = function (markup, result) {
    var attributes;

    attributes = result.attributes || {};

    return markup.concat([
      '<tr>',
        '<td>', attributes.num || _UNSPECIFIED, '</td>',
        '<td>', attributes.trenchid || _UNSPECIFIED, '</td>',
      '</tr>'
    ]);
  };

  _this.formatPolygonRow = function (markup, result) {
    var attributes;

    attributes = result.attributes || {};

    return markup.concat([
      '<tr>',
        '<td>', _this.formatName(attributes), '</td>',
        '<td>', attributes.age, '</td>',
        '<td>', attributes.rate, '</td>',
        '<td>', attributes.slipsense, '</td>',
      '</tr>'
    ]);
  };

  _this.formatPolylineRow = function (markup, result) {
    var attributes;

    attributes = result.attributes || {};

    return markup.concat([
      '<li class="fault-result">',
        _this.formatName(attributes),

        '<dl class="fault-info">',
          '<dt class="clear fault-cooperator-label">Collaborator</dt>',
          '<dd class="fault-cooperator-data">',
            attributes.cooperator || _UNSPECIFIED,
          '</dd>',

          '<dt class="clear fault-age-label">Age</dt>',
          '<dd class="fault-age-data">',
            attributes.age || _UNSPECIFIED,
          '</dd>',

          '<dt class="fault-rate-label">Slip Rate</dt>',
          '<dd class="fault-rate-data">',
            attributes.sliprate || _UNSPECIFIED,
          '</dd>',

          '<dt class="fault-sense-label" title="Sense of movement">',
            'Sense',
          '</dt>',
          '<dd class="fault-sense-data">',
            attributes.slipsense || _UNSPECIFIED,
          '</dd>',

          '<dt class="clear fault-strike-label">Strike</dt>',
          '<dd class="fault-strike-data">',
            attributes.azimuth || _UNSPECIFIED,
          '</dd>',

          '<dt class="fault-direction-label">Dip Direction</dt>',
          '<dd class="fault-direction-data">',
            attributes.dipdirecti || _UNSPECIFIED,
          '</dd>',

          '<dt class="fault-length-label">Length (km)</dt>',
          '<dd class="fault-length-data">',
            (attributes.hasOwnProperty('length')) ?
              (Math.round((attributes.length)*10)/10) :
              _UNSPECIFIED,
          '</dd>',

        '</dl>',
      '</li>'
    ]);
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
    this._map.on('click', _this.onClick, _this);
  };

  _this.onClick = function (clickEvent) {
    _this.destroyPopup();
    _popupLatLng = clickEvent.latlng;

    _services.forEach(function (service) {
      service.identify({
        latitude: _popupLatLng.lat,
        longitude: _popupLatLng.lng,
        success: _this.onServiceSuccess,
        error: _this.onServiceError
      });
    });
  };

  _this.onRemove = function (/*map*/) {
    this._map.off('click', _this.onClick, _this);
    this._map.closePopup();
    this.eachLayer(_this.removeLayerOrControl, _this);
    this._map = null;
  };

  _this.onServiceError = function () {
    console.log('An error occurred fetching data');
  };

  _this.onServiceSuccess = function (response) {
    if (response && response.results && response.results.length) {
      _this.addTabOutput(response.results);
    }
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


module.exports = QFaultLayer;
