var gulp = require('gulp');
var changed = require('gulp-changed');
var runSequence = require('run-sequence');
var to5 = require('gulp-babel');
var paths = require('../paths');
var compilerOptions = require('../babel-options');
var assign = Object.assign || require('object.assign');
var plumber = require('gulp-plumber');

gulp.task('build-cli', function () {
  return gulp.src(paths.source)
    .pipe(plumber())
    .pipe(to5(assign({}, compilerOptions, {modules:'common'})))
    .pipe(plumber.stop())
    .pipe(changed(paths.output))
    .pipe(gulp.dest(paths.output))
    // .pipe(gulp.dest('/Users/joelcox1/Jobs/Aurelia/cli/cli-test/node_modules/aurelia-cli/dist'));
});
gulp.task('build-templates', function () {
  return gulp.src(paths.sourceTemp)
    .pipe(changed(paths.output))
    .pipe(gulp.dest(paths.output))
    // .pipe(gulp.dest('/Users/joelcox1/Jobs/Aurelia/cli/cli-test/node_modules/aurelia-cli/dist'));
});

gulp.task('build', function(callback) {
  return runSequence(
    'clean',
    ['build-cli', 'build-templates'],
    callback
  );
});
