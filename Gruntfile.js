module.exports = function(grunt) {

  portfolioPath = "4.Build_a_Portfolio_Site/";

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
      }
    },

    imagemin: {
      options: {
        optimizationLevel: 5
      },
      portfolio: {
        files: [{
          expand: true,
          cwd: portfolioPath+"img/",
          src: ["**/*.{png,jpg,gif,svg}"],
          dest: portfolioPath+"img/"
        }]
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
      }
    },

    clean: {
      portfolio: [portfolioPath+"css/", portfolioPath+"img/"],
      portfolioFonts: [portfolioPath+"fonts/*"],
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
      }
    }
  });

  require("load-grunt-tasks")(grunt);

  grunt.registerTask("default", []);

  grunt.registerTask("portfolio-fonts", ["clean:portfolioFonts", "googlefonts:portfolio", "regex_replacer:fixPortfolioUrls", "regex_replacer:fixPortfolioStrings", "copy:portfolioFonts", "clean:fonts"]);

  grunt.registerTask("portfolio-css", ["copy:portfolioCSS", "postcss:portfolio", "cssmin:portfolio"]);

  grunt.registerTask("portfolio", ["clean:portfolio", "portfolio-fonts", "htmlmin:portfolio", "portfolio-css", "copy:portfolioImages", "responsive_images:portfolio", "imagemin:portfolio"]);
};
