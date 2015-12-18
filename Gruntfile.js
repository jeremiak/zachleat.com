/*global module:false,require:false,console:false */
module.exports = function(grunt) {

	require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
	require('time-grunt')(grunt);

	// Project configuration.
	grunt.initConfig({
		// Metadata.
		pkg: grunt.file.readJSON('package.json'),
		banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
			'<%= grunt.template.today("yyyy-mm-dd") %>\n' +
			'<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
			'* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>;' +
			' <%= pkg.license %> License */\n',
		config: {
			root: 'web/', // from domain root, do not include the first slash, do include a trailing slash
			// See also: yaml.vars.baseurl
			jsSrc: '<%= config.root %>js/',
			cssSrc: '<%= config.root %>css/',
			imgSrc: '<%= config.root %>img/',
			iconsSrc: '<%= config.imgSrc %>icons/',
			distFolder: '<%= config.root %>dist/<%= pkg.version %>/',
			distFeed: '<%- config.root %>_site/feed/atom.xml'
		},
		yaml: {
			file: '<%= config.root %>_config.yml',
			vars: {
				name: 'Web 3.0, 6 Bladed Razors, 7 Minute Abs',
				description: 'A web development blog written by @zachleat.',
				safe: false,
				baseurl: '/web',
				markdown: 'rdiscount',
				// https://github.com/mojombo/jekyll/wiki/Permalinks
				permalink: '/<%= config.root %>:title/',
				highlighter: 'pygments',
				relative_permalinks: false,
				distFolder: '/<%= config.distFolder %>'
			}
		},
		// Task configuration.
		concat: {
			options: {
				banner: '<%= banner %>',
				stripBanners: true
			},
			js: {
				src: [
					'<%= config.jsSrc %>initial.js',
					'node_modules/fontfaceonload/dist/fontfaceonload.js',
					'<%= config.jsSrc %>fonts.js',
					// 'node_modules/fontfaceobserver/fontfaceobserver.js',
					// '<%= config.jsSrc %>fonts-fontfaceobserver.js'
				],
				dest: '<%= config.distFolder %>initial.js'
			},
			jsAsync: {
				src: [
					'node_modules/fg-loadjs/loadJS.js',
					'node_modules/grunt-grunticon/example/output/grunticon.loader.js',
					'<%= config.jsSrc %>async.js'
					],
				dest: '<%= config.distFolder %>async.js'
			},
			jsDefer: {
				src: [
					'node_modules/infinity-burger/infinity-burger.js',
					'<%= config.jsSrc %>google-analytics.js',
					'<%= config.jsSrc %>disqus.js',
					'<%= config.jsSrc %>twitter-api.js'
					],
				dest: '<%= config.distFolder %>defer.js'
			}
			// CSS concat handled by SASS
		},
		uglify: {
			options: {
				banner: '<%= banner %>'
			},
			js: {
				src: '<%= concat.js.dest %>',
				dest: '<%= config.distFolder %>initial.min.js'
			},
			jsAsync: {
				src: '<%= concat.jsAsync.dest %>',
				dest: '<%= config.distFolder %>async.min.js'
			},
			jsDefer: {
				src: '<%= concat.jsDefer.dest %>',
				dest: '<%= config.distFolder %>defer.min.js'
			}
		},
		jshint: {
			options: {
				curly: true,
				eqeqeq: true,
				immed: true,
				latedef: true,
				newcap: true,
				noarg: true,
				sub: true,
				undef: true,
				unused: true,
				boss: true,
				eqnull: true,
				browser: true,
				globals: {}
			},
			gruntfile: {
				src: 'Gruntfile.js'
			},
			js: {
				src: ['js/**/*.js']
			}
		},
		sass: {
			dist: {
				options: {
					style: 'expanded',
					sourcemap: 'file'
				},
				files: {
					'<%= config.distFolder %>initial.css': '<%= config.cssSrc %>initial.scss',
					'<%= config.distFolder %>defer.css': '<%= config.cssSrc %>defer.scss'
				}
			}
		},
		cssmin: {
			dist: {
				options: {
					banner: '<%= banner %>'
				},
				files: {
					'<%= config.distFolder %>initial.min.css': ['<%= config.distFolder %>initial.css'],
					'<%= config.distFolder %>defer.min.css': ['<%= config.distFolder %>defer.css']
				}
			}
		},
		copy: {
			// Because sass won’t import css files
			'css-to-sass': {
				files: {
					'web/css/lib/_infinity-burger.scss': 'node_modules/infinity-burger/infinity-burger.css'
				}
			},
			// For CSS inlining
			includes: {
				files: {
					'<%= config.root %>_includes/initial.min.css': ['<%= config.distFolder %>initial.min.css'],
					'<%= config.root %>_includes/initial.css': ['<%= config.distFolder %>initial.css'],
					'<%= config.root %>_includes/initial.min.js': ['<%= config.distFolder %>initial.min.js'],
					'<%= config.root %>_includes/initial.js': ['<%= config.distFolder %>initial.js'],
					'<%= config.root %>_includes/async.min.js': ['<%= config.distFolder %>async.min.js'],
					'<%= config.root %>_includes/async.js': ['<%= config.distFolder %>async.js']
				}
			}
		},
		grunticon: {
			icons: {
				files: [{
					expand: true,
					cwd: "<%= config.iconsSrc %>",
					src: [ "*.svg" ],
					dest: "<%= config.distFolder %>icons/"
				}],
				options: {
					cssprefix: '.icon-',
					customselectors: {}
				}
			}
		},
		zopfli: {
			main: {
				options: {
					iteration: 15
				},
				files: [
					{
						expand: true,
						cwd: '<%= config.root %>_site/',
						src: ['**/*.html'],
						dest: '<%= config.root %>_site/',
						extDot: 'last',
						ext: '.html.zgz'
					},
					{
						expand: true,
						cwd: '<%= config.root %>_site/',
						src: ['**/*.js'],
						dest: '<%= config.root %>_site/',
						extDot: 'last',
						ext: '.js.zgz'
					},
					{
						expand: true,
						cwd: '<%= config.root %>_site/',
						src: ['**/*.css'],
						dest: '<%= config.root %>_site/',
						extDot: 'last',
						ext: '.css.zgz'
					},
					{
						expand: true,
						cwd: '<%= config.root %>_site/',
						src: ['**/*.svg'],
						dest: '<%= config.root %>_site/',
						extDot: 'last',
						ext: '.svg.zgz'
					}
				]
			}
		},
		htmlmin: {
			main: {
				options: {
					removeComments: true,
					collapseWhitespace: true
				},
				files: [
					{
						expand: true,
						cwd: '<%= config.root %>_site/',
						src: '**/*.html',
						dest: '<%= config.root %>_site/'
					}
				]
			}
		},
		shell: {
			jekyll: {
				// command: 'jekyll build --config _config.yml --trace --drafts',
				command: 'jekyll build --config _config.yml --trace',
				options: {
					execOptions: {
						cwd: '<%= config.root %>'
					}
				}
			},
			// generate the pygments css file
			pygments: {
				command: 'pygmentize -S default -f html > pygments.css',
				options: {
					execOptions: {
						cwd: '<%= config.cssSrc %>'
					}
				}
			},
			// TODO https://github.com/shama/grunt-beep
			upload: {
				command: 'echo "Note: Requires an \'zachleat\' host in .ssh/config"; rsync --archive --verbose --stats --compress --rsh=ssh ./_site/ zachleat:/home/public/<%= config.root %>',
				options: {
					maxBuffer: 1024 * 1024 * 64,
					execOptions: {
						cwd: '<%= config.root %>'
					}
				}
			}
		},
		clean: {
			js: [ '<%= config.root %>/_site/**/*.zgz' ]
		},
		watch: {
			assets: {
				files: ['<%= config.cssSrc %>**/*', '<%= config.jsSrc %>**/*'],
				tasks: ['assets', 'content']
			},
			grunticon: {
				files: ['<%= config.iconsSrc %>**/*'],
				tasks: ['grunticon', 'content']
			},
			content: {
				files: ['<%= config.root %>_posts/**/*', '<%= config.root %>_layouts/**/*', '<%= config.root %>_drafts/**/*', '<%= config.root %>speaking/**/*', '<%= config.root %>projects/**/*', '<%= config.root %>about/**/*', '<%= config.root %>license/**/*', '<%= config.root %>feed/**/*', '<%= config.root %>index.html', '<%= config.root %>_plugins/**/*', '<%= config.root %>_includes/**/*', '<%= config.root %>personal/**/*' ],
				tasks: ['content']
			},
			config: {
				files: ['Gruntfile.js'],
				tasks: ['config']
			}
		}
	});

	grunt.registerTask( 'yaml', function() {
		var output = grunt.config( 'yaml.file' ),
			vars = grunt.config( 'yaml.vars' ),
			fs = require('fs'),
			str = [ '# Autogenerated by `grunt config`' ];

		for( var j in vars ) {
			str.push( j + ': ' + vars[ j ] );
		}

		var err = fs.writeFileSync( output, str.join( '\n' ) );
		if(err) {
			console.log(err);
		} else {
			console.log( output + ' write successful.');
		}
	});

	grunt.registerTask( 'feedburner-size', function() {
		var feed = grunt.config.get( 'config.distFeed' ),
			fs = require('fs');

		var stats = fs.statSync( feed ),
			kbSize = Math.ceil( stats.size / 1024 ),
			isTooLarge = kbSize > 512,
			msg = 'Your atom.xml is ' + ( isTooLarge ? 'too large' : 'ok' ) + ' (' + kbSize + 'KB) for Feedburner (512KB max).';

		if( isTooLarge ) {
			grunt.fail.warn( msg );
		} else {
			grunt.log.writeln( msg );
		}
	});

	// Default task.
	grunt.registerTask('assets', ['copy:css-to-sass', 'sass', 'jshint', 'concat', 'uglify', 'cssmin']);
	grunt.registerTask('images', ['grunticon']);
	grunt.registerTask('config', ['yaml']);
	grunt.registerTask('content', ['copy:includes', 'shell:jekyll']);
	grunt.registerTask('default', ['clean', 'config', 'assets', 'content', 'feedburner-size']);

	// Upload to Production
	grunt.registerTask('stage', ['clean', 'config', 'assets', 'images', 'content', 'feedburner-size', 'htmlmin', 'zopfli']);
	grunt.registerTask('deploy', ['stage', 'shell:upload']);
};
