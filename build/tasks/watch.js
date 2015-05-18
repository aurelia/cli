var paths = require('../paths');
var gulp  = require('gulp');

gulp.task('watch', ['build'], function() {
  gulp.watch(paths.source, ['build-cli'])
  gulp.watch(paths.sourceTemp, ['build-templates'])
});
