'use strict';

module.exports = function (grunt) {

	require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

	grunt.initConfig({
		clean: {
			build: ['dist'],
			tmp: ['.tmp']
		},

		connect: {
			options: {
				hostname: '*',
				port: 8080,
				open: true,
				useAvailablePort: true
			},
			dev: {
				options: {
					base: ['src/htdocs', '.tmp', 'node_modules'],
					middleware: function (connect, options) {
						var handlers = [
							require('grunt-connect-proxy/lib/utils').proxyRequest
						];

						if (!require('util').isArray(options.base)) {
							options.base = [options.base];
						}

						options.base.forEach(function (base) {
							handlers.push(connect.static(base));
						});

						return handlers;
					}
				}
			},
			dist: {
				options: {
					base: ['dist/htdocs', 'node_modules'],
					keepalive: true
				}
			},
			proxies: [
				{
					context: '/hazards',
					host: 'earthquake.usgs.gov',
					port: 80,
					https: false,
					changeOrigin: true,
					xforward: false
				}
			]
		},

		copy: {
			dist: {
				expand: true,
				cwd: 'src',
				src: '**/*',
				dest: 'dist'
			},
			'dist-leaflet': {
				expand: true,
				cwd: 'node_modules/leaflet/dist',
				src: '**/*',
				dest: 'dist/htdocs/leaflet'
			},
			'dist-requirejs': {
				expand: true,
				cwd: 'node_modules/requirejs',
				src: 'require.js',
				dest: 'dist/htdocs/requirejs'
			},
			leaflet: {
				expand: true,
				cwd: 'node_modules/leaflet/dist',
				src: '**/*',
				dest: '.tmp/leaflet/'
			}
		},

		exec: {
			leaflet: {
				cmd: 'npm install',
				cwd: 'node_modules/leaflet'
			}
		},

		jshint: {
			options:{jshintrc: true},
			dev: ['src/htdocs/js/**/*.js', 'Gruntfile.js']
		},

		watch: {
			js: {
				files: ['src/htdocs/js/**/*.js', 'Gruntfile.js'],
				tasks: ['jshint:dev']
			},
			livereload: {
				options: {
					livereload: true
				},
				files: [
					'.tmp/css/**/*.css',
					'src/htdocs/css/**/*.css',
					'src/htdocs/**/*.php',
					'src/htdocs/js/**/*.js'
				]
			},
		}
	});

	grunt.registerTask('init', function () {
		if (!require('fs').existsSync('.tmp/leaflet/leaflet-src.js')) {
			grunt.task.run([
				'exec:leaflet',
				'copy:leaflet'
			]);
		}
	});

	grunt.registerTask('default', [
		'init',
		'configureProxies',
		'connect:dev',
		'watch'
	]);

	grunt.registerTask('build', function (legacy) {
		var tasks = [
			'clean:build',
			'init',
			'jshint',

			'copy:dist',
			'copy:dist-leaflet',
			'copy:dist-requirejs'
		];

		if (legacy === 'legacy') {
			// Add tasks to downgrade stuff to work on legacy deployments
		}

		grunt.task.run(tasks);
	});

	grunt.registerTask('dist', [
		'build',
		'connect:dist'
	]);
};
