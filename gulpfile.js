var gulp  = require('gulp');
var babel = require('gulp-babel');

var srcFiles      = ['src/**/*.js', '!**/templates/**/*.js']
  , templateFiles = 'src/**/templates/**/*.*';

gulp.task('default', ['copy-source', 'copy-templates'], function () {

});

gulp.task('copy-source', function() {
  return gulp.src(srcFiles)
    .pipe(babel({
      stage:2,
      optional: [
        "es7.decorators",
        "es7.classProperties",
        "runtime"
      ]
    }))
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
