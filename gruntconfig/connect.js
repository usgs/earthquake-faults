'use strict';


var config = require('./config');


var addMiddleware = function (connect, options, middlewares) {
  middlewares.unshift(
    require('compression')({
      filter: function (req, res) {
        var type = res.getHeader('Content-Type');
        return (type+'').match(/(css|javascript)/);
      }
    }),
    require('grunt-connect-rewrite/lib/utils').rewriteRequest,
    require('grunt-connect-proxy/lib/utils').proxyRequest//,
    // require('gateway')(options.base[0], {
    //   '.php': 'php-cgi',
    //   'env': {
    //     'PHPRC': 'node_modules/hazdev-template/dist/conf/php.ini'
    //   }
    // })
  );
  return middlewares;
};


var connect = {
  options: {
    hostname: '*'
  },

  proxies: [
    {
      context: '/theme/',
      host: 'localhost',
      port: config.templatePort,
      rewrite: {
        '^/theme': ''
      }
    }
  ],

  rules: [
    // Last rule works as ALIAS directive for MOUNT_PATH
    {
      from: '^' + config.ini.MOUNT_PATH + '(.*)$',
      to: '$1'
    }
  ],


  dev: {
    options: {
      base: [
        config.build + '/' + config.src + '/htdocs'
      ],
      livereload: config.liveReloadPort,
      middleware: addMiddleware,
      open: 'http://localhost:' + config.buildPort + config.ini.MOUNT_PATH +
          '/index.html',
      port: config.buildPort
    }
  },

  dist: {
    options: {
      base: [
        config.dist + '/htdocs'
      ],
      keepalive: true,
      middleware: addMiddleware,
      open: 'http://localhost:' + config.distPort + config.ini.MOUNT_PATH +
          '/index.html',
      port: config.distPort
    }
  },

  template: {
    options: {
      base: [
        'node_modules/hazdev-template/dist/htdocs'
      ],
      // middleware: addMiddleware,
      port: config.templatePort
    }
  },

  test: {
    options: {
      base: [
        config.build + '/' + config.src + '/htdocs',
        config.build + '/' + config.test,
        // config.etc,
        'node_modules'
      ],
      open: 'http://localhost:' + config.testPort + '/test.html',
      port: config.testPort,
    }
  }
};


module.exports = connect;
