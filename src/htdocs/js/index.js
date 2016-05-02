'use strict';

var FaultApp = require('FaultApp');


var defaultLayer;


if (window.location.hash) {
  defaultLayer = window.location.hash.replace('#', '');
} else {
  defaultLayer = FaultApp.QFAULT_LAYER;
}

FaultApp({
  el: document.querySelector('.earthquake-faults-app'),
  layer: defaultLayer
});
