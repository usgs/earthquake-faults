'use strict';


var autoprefixer = require('autoprefixer'),
    cssnano = require('cssnano'),
    calc = require('postcss-calc'),
    postcssImport = require('postcss-import'),
    precss = require('precss');


var config = require('./config'),
    CWD = '.',
    NODE_MODULES = CWD + '/node_modules';


var postcss = {
  build: {
    options: {
      map: true,
      processors: [
        postcssImport({
          path: [
              CWD + '/' + config.src + '/htdocs',
              NODE_MODULES + '/hazdev-leaflet/src',
              NODE_MODULES + '/hazdev-tablist/src',
              NODE_MODULES + '/hazdev-template/src',
              NODE_MODULES + '/hazdev-webutils/src'
          ]
        }),
        precss(),
        calc(),
        autoprefixer({
          'browsers': [
            'last 3 versions'
          ]
        })
      ]
    },
    expand: true,
    cwd: config.src + '/htdocs',
    src: [
      '**/*.scss',
      '!**/_*.scss'
    ],
    dest: config.build + '/' + config.src + '/htdocs',
    ext: '.css',
    extDot: 'last'
  },

  dist: {
    options: {
      processors: [
        cssnano({zindex: false})
      ]
    },
    expand: true,
    cwd: config.build + '/' + config.src + '/htdocs',
    src: [
      '**/*.css'
    ],
    dest: config.dist + '/htdocs'
  }
};


module.exports = postcss;
