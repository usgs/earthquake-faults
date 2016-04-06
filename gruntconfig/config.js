'use strict';


var fs = require('fs'),
    ini = require('ini');


var BASE_PORT = 8100;

var iniConfig = ini.parse(fs.readFileSync('./src/conf/config.ini', 'utf-8'));


var config = {
  build: '.build',
  buildPort: BASE_PORT,
  dataPort: BASE_PORT + 7,
  dist: 'dist',
  distPort: BASE_PORT + 2,
  etc: 'etc',
  example: 'example',
  examplePort: BASE_PORT + 3,
  ini: iniConfig,
  liveReloadPort: BASE_PORT + 9,
  src: 'src',
  templatePort: BASE_PORT + 8,
  test: 'test',
  testPort: BASE_PORT + 1
};


module.exports = config;
