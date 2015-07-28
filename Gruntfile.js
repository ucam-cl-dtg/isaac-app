module.exports = function(grunt) {

  var distOutputDir = "dist";
  var distOutputFile = "isaac-app.tar.gz";

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    sass: {
      options: {
        includePaths: ["app/bower_components/foundation/scss"],
      },
      dist: {
        options: {
          outputStyle: 'compressed',
          sourceMap: true,
        },
        files: {
          'app/css/app.css': 'scss/app.scss'
        }        
      }
    },


    // In order to compile clojurescript, you will need "lein" on your path:
    // http://leiningen.org/#install
    exec: {
      watchcljs: {
        cmd: "lein cljsbuild auto",
        cwd: "equation_parser",
      }
    },

    watch: {
      options: {
        atBegin: true,
      },

      sass: {
        files: 'scss/**/*.scss',
        tasks: ['sass', 'bell']
      }
    },

    ngtemplates:  {
      options: {
        url: function(u) { return u.replace("app/partials", "/partials"); },
        bootstrap: function(module, script) {
          return 'define([], function() { angular.module("isaac.templates",[]).run(["$templateCache", function($templateCache) {' + script + '}])});';
        },
/*        htmlmin: {
          collapseBooleanAttributes:      false,
          collapseWhitespace:             false, // This removes spaces before tags, which we often rely on. Maybe we shouldn't.
          removeAttributeQuotes:          true,
          removeEmptyAttributes:          true,
          removeComments:                 true,
          removeRedundantAttributes:      false, // This removes type="text" on inputs, which prevents CSS being applied properly.
          removeScriptTypeAttributes:     true,
          removeStyleLinkTypeAttributes:  false
        },*/  // Do not run htmlmin at all. We don't need it - apache will compress the file for transfer anyway.
      },
      local: {
        src: 'app/partials/**/*.html',
        dest: 'app/js/templates.js',
      },
      dist: {
        src: 'app/partials/**/*.html',
        dest: distOutputDir + '/app/js/templates.js',
      }
    },

    requirejs: {
      options: {
//        logLevel: 0, // Enable this line to see all debug output from requirejs optimiser
        baseUrl: 'app/js/',
        mainConfigFile: 'app/js/isaac.js',

        name: "app/app",
        findNestedDependencies: true,

        insertRequire: ["app/app"],

      },
      local: {
        options: {
          out: "app/js/isaac.js",
          optimize: "none",
        },
      },
      dist: {
        options: {
          out: distOutputDir + "/app/js/isaac.js",
          optimize: "uglify",
          paths: {
            "templates": "../../" + distOutputDir + "/app/js/templates",
          }
        },
      },
    },

    clean: {
      dist: [distOutputDir + "/**", distOutputFile],
      distPartials: [distOutputDir + "/app/partials/**"],
      localBackup: ["app/**/*.localbackup"],
    },

    copy: {
      dist: {
        files: [{
          expand: true,
          cwd: 'app/',
          src: ['**'],
          dest: distOutputDir + '/app/',
          filter: 'isFile',
          dot: true,
        }]
      },

      backupLocal: {
        files: {
          "app/js/isaac.js.localbackup": "app/js/isaac.js", 
          "app/js/templates.js.localbackup": "app/js/templates.js"
        }
      },
      restoreLocal: {
        files: {
          "app/js/isaac.js": "app/js/isaac.js.localbackup", 
          "app/js/templates.js": "app/js/templates.js.localbackup"
        }
      }

    },

    compress: {
      dist: {
        options: {
          archive: distOutputFile,
        },
        files: [{
          expand: true,
          cwd: distOutputDir + "/",
          src: ['app/**'],
          dot: true,
          filter: 'isFile',
        }]
      }
    },
    
  });

  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-bell');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-angular-templates');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-scp');
  grunt.loadNpmTasks('grunt-exec');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-compress');

  grunt.registerTask('build', ['sass']);
  grunt.registerTask('dist', ['clean:dist', 'copy:restoreLocal', 'clean:localBackup', 'copy:dist', 'ngtemplates:dist', 'clean:distPartials', 'requirejs:dist', 'compress:dist']);
  grunt.registerTask('watchcljs', ['exec:watchcljs']);

  grunt.registerTask('segue-version', 'Get the version of the segue api that this package depends on.', function() {
    grunt.log.write("segueVersion:" + grunt.file.readJSON('package.json').segueVersion);
  });
}