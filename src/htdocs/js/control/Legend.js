/* global L */
'use strict';


var Util = require('util/Util');


var _DEFAULTS = {
  position: 'topright',
  download: 'data/shapefile.zip',
  legend: 'images/legend.png',
  title: 'Custom'
};


var Legend = function (options) {
  var _this,
      _initialize,

      _download,
      _legend,
      _title;

  options = Util.extend({}, _DEFAULTS, options);
  _this = L.control(options);

  _initialize = function (options) {
    _download = options.download;
    _legend = options.legend;
    _title = options.title;
  };

  _this.onAdd = function (map) {
    var container;

    _this.map = map; // Still attach to _this so rest of API works
    container = document.createElement('div');
    container.classList.add('legend');

    container.innerHTML = [
      '<h2 class="title">', _title, '</h2>',
      '<img class="image" src="', _legend, '" alt="', _title, ' Legend"/>',
      '<a class="download" href="', _download, '" target="_blank">',
        'Download Shapefile',
      '</a>'
    ].join('');

    return container;
  };

  _this.onRemove = function (/*map*/) {
    _this.map = null;
  };


  _initialize(options);
  options = null;
  return _this;
};

module.exports = Legend;
