module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        watch: {
            options: {
                livereload: true
            },
            tasks: ['browserify'/*, 'uglify'*/],
            files: ['src/*.js', 'index.html', 'css/*', 'Gruntfile.js', 'browserify.js']
        },
        browserify: {
            'build/<%= pkg.name %>.js': ['src/main.js']
        },
        uglify: {
            main: {
                files: {
                    'build/<%= pkg.name%>.min.js': 'build/<%= pkg.name %>.js'
                }
            }
        },
        clean:{
            production: {
                options: { force: true },
                src: ["production/"]
              },
        },
        copy:{
            build: {
                expand: true,
                //cwd: "public/tmp/",
                src: [
                'build/**.min.js',
                'index.html',
                'css/**',
                'images/**',
                'js/**'
                ],
                dest: "production/"
            }
        }
        
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.registerTask('release', ['browserify', 'uglify','clean:production','copy:build']);


};
