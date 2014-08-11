'use strict';

module.exports = function (grunt) {

	require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

	grunt.initConfig({
		connect: {
			options: {
				hostname: '*',
				port: 8080,
				open: true,
				useAvailablePort: true
			},
			dev: {
				options: {
					base: ['src/htdocs', '.tmp', 'node_modules']
				}
			}
		},

		copy: {
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
		'connect:dev',
		'watch'
	]);
};
