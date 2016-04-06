'use strict';


var config = require('./config');


var CWD = '.',
    EXPORTS = [],
    NODE_MODULES = CWD + '/node_modules';


/**
 * Utility function for managing EXPORTS array.
 *
 * @param basedir {String}
 *        export base directory, relative to project root.
 * @param files {Array<String>}
 *        array of files to add to export.
 */
var addExports = function (basedir, files) {
  files.forEach(function (f) {
    EXPORTS.push(CWD + '/' + basedir + '/' + f + '.js:' + f);
  });
};


// hazdev-webutils exports
addExports('node_modules/hazdev-webutils/src', [
]);

// project exports
addExports(config.src + '/htdocs/js', [
]);

// Subsequent source files can then require "Class" with:
// var Class = require('package/Class');


var browerify = {
  options: {
    browserifyOptions: {
      debug: true,
      paths: [
        CWD + '/' + config.src + '/htdocs/js',
        NODE_MODULES + '/hazdev-webutils/src'
      ]
    }
  },


  // the bundle used by the index page
  index: {
    src: [config.src + '/htdocs/js/index.js'],
    dest: config.build + '/' + config.src + '/htdocs/js/index.js'
  },

  // the bundle used by tests
  bundle: {
    src: [],
    dest: config.build + '/' + config.src + '/htdocs/js/bundle.js',
    options: {
      alias: EXPORTS
    }
  },

  // the bundle of test suites
  test: {
    src: [config.test + '/test.js'],
    dest: config.build + '/' + config.test + '/test.js',
    options: {
      external: EXPORTS
    }
  }
};


module.exports = browerify;
