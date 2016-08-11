
var fs = require('fs');
var path = require('path');
var gulp = require('gulp');
var gutil = require('gulp-util');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var sourcemaps = require('gulp-sourcemaps');
var prompt = require('prompt');
var async = require('async');
var request = require('request');
var File = require('vinyl');
var spawn = require('cross-spawn-async');

function vinyl_file_gulpstream(vinylfile) {
  var src = require('stream').Readable({ objectMode: true })
  src._read = function () {
    this.push(vinylfile)
    this.push(null)
  }
  return src
}
gulp.task('js', function (callback) {

  var requirejs = require('requirejs');
  var bower = '../bower_components/';
  var optimize = typeof(process.env['nooptimize']) === "undefined";

  var config = {
      baseUrl: '',
      name: 'init/Init',
      include: [
        'requireLib',
        'text'
      ],
      generateSourceMaps: !optimize,
      preserveLicenseComments: optimize,
      optimize: optimize ? "uglify" : "none",
      out: 'static/App.js',
      paths: {
          'jquery': bower + 'jquery/dist/jquery',
          'underscore': bower + 'underscore/underscore',
          'backbone': bower + 'backbone/backbone',
          'marionette': bower + 'backbone.marionette/lib/backbone.marionette',
          'backbone.validation': bower + 'backbone.validation/src/backbone-validation-amd',
          'backbone.stickit': bower + 'backbone.stickit/backbone.stickit',
          'backbone-filter': bower + 'backbone-filtered-collection/backbone-filtered-collection',
          'bootstrap': bower + 'bootstrap/dist/js/bootstrap',
          'text': bower + 'text/text',
          'select2': bower + 'select2/dist/js/select2',
          'requireLib': bower + 'almond/almond',
          'parsleyjs': bower + 'parsleyjs/dist/parsley'
      }
  };


  return requirejs.optimize(config, function (res) {

      callback();

  }, function(err) {
    console.log(err);
  });

});

gulp.task('sass', function () {

  gulp.src('sass/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({
      style: 'compressed',
      includePaths: [ 
      path.join(__dirname, 'bower_components', 'bootstrap-sass', 'assets', 'stylesheets'),
      path.join(__dirname, 'bower_components'),
      path.join(__dirname, 'sass')
    ]}).on('error', sass.logError))
    .pipe(autoprefixer({
      browsers: ['last 3 versions'],
      cascade: false
    }))
    .pipe(sourcemaps.write('./maps'))
    .pipe(gulp.dest(path.join(__dirname, 'static')));

});

gulp.task('copy', function() {
  gulp.src([path.join(__dirname, 'bower_components', 'bootstrap', 'fonts') + '/**/*' ])
    .pipe(gulp.dest(path.join(__dirname, 'static', 'fonts')));
});

gulp.task('build', ['js', 'sass', 'copy'], function () {
   
});


var python = /^win/.test(process.platform) ? 
  path.join(__dirname, 'env', 'Scripts', 'python.exe') : 
  path.join(__dirname, 'env', 'bin', 'python');

var manage = path.join(__dirname, 'django', 'manage.py');

gulp.task('connectdjango', function () {
    var env = process.env,
        varName,
        envCopy = {DJANGO_DEV:1};

    // Copy process.env into envCopy
    for (varName in env) {
      envCopy[varName] = env[varName];
    }
    return spawn(python, [
       manage, 'runserver', '0.0.0.0:9000'
    ], {stdio: 'inherit', env: envCopy});

});

gulp.task('manage', function (callback) {
  prompt.start();
  prompt.get([{
    name: 'command',
    description: 'Command',
    type: 'string',
    required: true
  }], function(err, result) {
    
  var env = process.env,
        varName,
        envCopy = {DJANGO_DEV:1};

    // Copy process.env into envCopy
    for (varName in env) {
      envCopy[varName] = env[varName];
    }
    return spawn(python,
       [manage].concat(result['command'].split(' '))
    , {stdio: 'inherit', env: envCopy});
    callback();
  });

});
gulp.task('serve', ['connectdjango'], function () {
   
    require('opn')('http://localhost:9000');
    
    gulp.watch(['./js/**/*'], ['js']);
    gulp.watch(['./sass/**/*'], ['sass']);
});
