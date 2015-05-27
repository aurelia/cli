var gulp  = require('gulp');
var babel = require('gulp-babel');

var srcFiles      = ['src/**/*.js', '!**/templates/**/*.js']
  , templateFiles = 'src/**/templates/**/*.js';

gulp.task('default', ['copy-source', 'copy-templates'], function () {

});

gulp.task('copy-source', function() {
  return gulp.src(srcFiles)
    .pipe(babel())
    .pipe(gulp.dest('dist'));
});

gulp.task('copy-templates', function() {
  return gulp.src(templateFiles)
    .pipe(gulp.dest('dist'));
});

gulp.task('watch', function() {
  gulp.watch(srcFiles, ['copy-source']);
  gulp.watch(templateFiles, ['copy-templates']);
});
