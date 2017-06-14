'use strict';

var ngrok = require('ngrok');

module.exports = function(grunt) {

    var portfolioPath = "4.Build_a_Portfolio_Site/";
    var webOptimizationPath = "7.Website_Optimization/";
    var neighborhoodMapPath = "8.Neighborhood_Map/";

    grunt.initConfig({
        responsive_images: {
            portfolio: {
                options: {
                    engine: "im",
                    newFilesOnly: true,
                    sizes: [
                        {
                            name: "small",
                            width: 550,
                            quality: 70
                        },
                        {
                            name: "medium",
                            width: 750,
                            quality: 70
                        },
                        {
                            name: "large",
                            width: 940,
                            quality: 70
                        },
                        {
                            name: "large",
                            suffix: "-2x",
                            width: 1880,
                            quality: 70
                        }
                    ]
                },
                files: [{
                    expand: true,
                    src: ["*.{gif,jpg,png}"],
                    cwd: portfolioPath+"src/img/resizable/",
                    dest: portfolioPath+"img/"
                }]
            },
            webOptimization: {
                options: {
                    engine: "im",
                    newFilesOnly: true,
                    sizes: [
                        {
                            width: 100,
                            quality: 70
                        },
                        {
                            rename: false,
                            width: 550,
                            quality: 70
                        }
                    ]
                },
                files: [{
                    expand: true,
                    src: ["*.{gif,jpg,png}"],
                    cwd: webOptimizationPath+"src/views/images/resizable/",
                    dest: webOptimizationPath+"dist/views/images/"
                }]
            }
        },

        imagemin: {
            options: {
                optimizationLevel: 6
            },
            portfolio: {
                files: [{
                    expand: true,
                    cwd: portfolioPath+"img/",
                    src: ["**/*.{png,jpg,gif,svg}"],
                    dest: portfolioPath+"img/"
                }]
            },
            webOptimization: {
                files: [
                    {
                        expand: true,
                        cwd: webOptimizationPath+"dist/",
                        src: ["**/*.{png,jpg,gif,svg}"],
                        dest: webOptimizationPath+"dist/"
                    }
                ]
            },
            neighborhoodMap: {
                files: [
                    {
                        expand: true,
                        cwd: neighborhoodMapPath+"dist/",
                        src: ["**/*.{png,jpg,gif,svg}"],
                        dest: neighborhoodMapPath+"dist/"
                    }
                ]
            }
        },

        googlefonts: {
          portfolio: {
            options: {
              fontPath: "fonts/",
              httpPath: "../fonts/",
              cssFile: portfolioPath+"css/fonts.css",
              fonts: [
                {
                  family: "Julius Sans One",
                  styles: [
                    400
                  ],
                  subsets: [
                    "latin"
                  ],
                }
              ]
            }
          }
        },

        regex_replacer: {
          fixPortfolioUrls: {
            src: portfolioPath+"css/fonts.css",
            regex: /url\(\'[\s\w/.-]*\'\)/g,
            replacement: function (match) {
              return match.slice(0, 4)+match.slice(5, -2)+")";
            }
          },
          fixPortfolioStrings: {
            src: portfolioPath+"css/fonts.css",
            regex: /\'[\s\w/.-]*\'/g,
            replacement: function (match) {
              return "\""+match.slice(1, -1)+"\"";
            }
          }
        },

        postcss: {
            options: {
                processors: [
                    require("autoprefixer")
                ]
            },
            portfolio: {
                expand: true,
                cwd: portfolioPath+"src/css/",
                src: ["*.css", "!normalize.css"],
                dest: portfolioPath+"css/"
            },
            neighborhoodMap: {
                expand: true,
                cwd: neighborhoodMapPath+"src/css/",
                src: ["*.css", "!normalize.min.css"],
                dest: neighborhoodMapPath+"dist/css/"
            }
        },

        cssmin: {
            portfolio: {
                files: [{
                    expand: true,
                    cwd: portfolioPath+"css/",
                    src: ["*.css", "!*.min.css"],
                    dest: portfolioPath+"css/",
                    ext: ".min.css"
                }]
            },
            webOptimization: {
                files: [{
                    expand: true,
                    cwd: webOptimizationPath+"src/",
                    src: ["**/*.css", "!**/*.min.css"],
                    dest: webOptimizationPath+"dist/"
                }]
            },
            neighborhoodMap: {
                files: [{
                    expand: true,
                    cwd: neighborhoodMapPath+"dist/css/",
                    src: ["*.css", "!**/*.min.css"],
                    dest: neighborhoodMapPath+"dist/css/"
                }]
            }
        },

        htmlmin: {
            portfolio: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true
                },
                files: [
                    {
                        expand: true,
                        cwd: portfolioPath+"src/",
                        src: ["*.html"],
                        dest: portfolioPath
                    }
                ]
            },
            webOptimization: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true
                },
                files: [
                    {
                        expand: true,
                        cwd: webOptimizationPath+"src/",
                        src: ["**/*.html"],
                        dest: webOptimizationPath+"dist/"
                    }
                ]
            },
            neighborhoodMap: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true
                },
                files: [
                    {
                        expand: true,
                        cwd: neighborhoodMapPath+"src/",
                        src: ["**/*.html"],
                        dest: neighborhoodMapPath+"dist/"
                    }
                ]
            }
        },

        uglify: {
            webOptimization: {
                files: [{
                    expand: true,
                    cwd: webOptimizationPath+"src/",
                    src: "**/*.js",
                    dest: webOptimizationPath+"dist/"
                }]
            },
            neighborhoodMap: {
                files: [{
                    expand: true,
                    cwd: neighborhoodMapPath+"src/",
                    src: "**/*.js",
                    dest: neighborhoodMapPath+"dist/"
                }]
            }
        },

        clean: {
          portfolio: [portfolioPath+"css/", portfolioPath+"img/"],
          portfolioFonts: [portfolioPath+"fonts/*"],
          webOptimization: [webOptimizationPath+"dist/"],
          neighborhoodMap: [neighborhoodMapPath+"dist/"],
          fonts: ["fonts/"]
        },

        copy: {
            portfolioCSS: {
                files: [
                    {
                        expand: true,
                        src: ["*/**", "normalize.css"],
                        cwd: portfolioPath+"src/css/",
                        dest: portfolioPath+"css/"
                    }
                ]
            },
            portfolioImages: {
                files: [
                    {
                        expand: true,
                        src: ["*.{jpg,gif,png,svg}"],
                        cwd: portfolioPath+"src/img/",
                        dest: portfolioPath+"img/"
                    }
                ]
            },
            portfolioFonts: {
                files: [
                    {
                        expand: true,
                        src: ["fonts/**"],
                        dest: portfolioPath
                    }
                ]
            },
            webOptimizationImages: {
                files: [
                    {
                        expand: true,
                        src: ["*.{jpg,gif,png,svg}"],
                        cwd: webOptimizationPath+"src/img/",
                        dest: webOptimizationPath+"dist/img"
                    },
                    {
                        expand: true,
                        src: ["*.{jpg,gif,png,svg}"],
                        cwd: webOptimizationPath+"src/views/images/",
                        dest: webOptimizationPath+"dist/views/images/"
                    }
                ]
            },
            neighborhoodMap: {
                files: [
                    {
                        expand: true,
                        src: ["*.{jpg,gif,png,svg}"],
                        cwd: neighborhoodMapPath+"src/img/",
                        dest: neighborhoodMapPath+"dist/img"
                    },
                    {
                        expand: true,
                        src: ["*.min.css", "*/**"],
                        cwd: neighborhoodMapPath+"src/css/",
                        dest: neighborhoodMapPath+"dist/css/"
                    }
                ]
            }
        },

        jshint: {
            options: {
                reporter: require('jshint-stylish')
            },
            neighborhoodMap: {
                files: [
                    {
                        expand: true,
                        src: ["**/*.js", "!**/knockout-3.4.2.js"],
                        cwd: neighborhoodMapPath+"src/"
                    }
                ]
            }
        },

        pagespeed: {
            options: {
                nokey: true,
                locale: "en_GB",
                threshold: 40
            },
            local: {
                options: { strategy: "desktop" }
            },
            mobile: {
                options: { strategy: "mobile" }
            }
        }
    });

    require("load-grunt-tasks")(grunt);

    grunt.registerTask("portfolio-fonts", ["clean:portfolioFonts", "googlefonts:portfolio", "regex_replacer:fixPortfolioUrls", "regex_replacer:fixPortfolioStrings", "copy:portfolioFonts", "clean:fonts"]);

    grunt.registerTask("portfolio-css", ["copy:portfolioCSS", "postcss:portfolio", "cssmin:portfolio"]);

    grunt.registerTask("portfolio", ["clean:portfolio", "portfolio-fonts", "htmlmin:portfolio", "portfolio-css", "copy:portfolioImages", "responsive_images:portfolio", "imagemin:portfolio"]);

    grunt.registerTask("webOptimization", ["clean:webOptimization", "htmlmin:webOptimization", "cssmin:webOptimization", "uglify:webOptimization", "copy:webOptimizationImages", "responsive_images:webOptimization", "imagemin:webOptimization"]);

    grunt.registerTask("neighborhoodMap", ["jshint:neighborhoodMap", "clean:neighborhoodMap", "htmlmin:neighborhoodMap", "postcss:neighborhoodMap", "cssmin:neighborhoodMap", "uglify:neighborhoodMap", "copy:neighborhoodMap", "imagemin:neighborhoodMap"]);

    grunt.registerTask("default", ["portfolio", "webOptimization", "neighborhoodMap"]);

    grunt.registerTask('ngrok', 'Run pagespeed with ngrok', function() {
        var done = this.async();
        var port = 8080;

        ngrok.connect(port, function(err, url) {
            if (err !== null) {
                grunt.fail.fatal(err);
                return done();
            }

            grunt.config.set('pagespeed.options.url', url);
            grunt.task.run('pagespeed');
            done();
        });
    });
};
