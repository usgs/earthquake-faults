/* global L */
'use strict';


var Util = require('util/Util');


var _DEFAULTS = {
  position: 'bottomleft',
  href: '/',
  src: 'images/logo.png',
  title: 'U.S. Geological Survey'
};


var Logo = function (options) {
  var _this,
      _initialize,

      _href,
      _src,
      _title;

  options = Util.extend({}, _DEFAULTS, options);
  _this = L.control(options);

  _initialize = function (options) {
    _href = options.href;
    _src = options.src;
    _title = options.title;
  };

  _this.onAdd = function (map) {
    var container;

    _this.map = map; // Still attach to _this so rest of API works
    container = document.createElement('a');

    container.classList.add('control-logo');
    container.setAttribute('href', _href);
    container.setAttribute('title', _title);

    container.innerHTML = '<img src="' + _src + '" alt="' + _title + '"/>';

    return container;
  };

  _this.onRemove = function (/*map*/) {
    _this.map = null;
  };


  _initialize(options);
  options = null;
  return _this;
};

module.exports = Logo;
