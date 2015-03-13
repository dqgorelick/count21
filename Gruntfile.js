module.exports = function(grunt){
//configure tasks
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		uglify: {
			build: { 
				src: 'src/js/*.js',
				dest: 'js/main.js'	
			},
			dev: {
				options: {
					beautify: true,
					mangle: false,
					compress: false, 
					preserveComments: 'all'
				},
				src: 'src/js/*.js',
				dest: 'js/main.js'	
			}
		},
		sass: {
			dev: {
				options: {
					outputStyle: 'expanded'
				},
				files: {
					'css/main.css' : 'src/scss/main.scss'
				}
			},
			build: {
				options: {
					outputStyle: 'compressed'
				},
				files: {
					'css/main.css' : 'src/scss/main.scss'
				}
			}
		},
		jshint: {
			files: ['src/**/*.js']
		},
		watch: {
			css: {
				files: ['src/scss/*.scss'],
				tasks: ['sass:dev']
			},
			js: {
				files: ['src/js/*.js'],
				tasks: ['jshint','uglify:dev']
			}
		}
	});
	//load plugins
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-sass');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	//configure tasks
	grunt.registerTask('default', ['jshint','uglify:dev', 'sass:dev']);
	grunt.registerTask('build', ['jshint','uglify:build', 'sass:build']);
}
