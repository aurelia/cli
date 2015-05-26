var gulp  = require('gulp');
var babel = require('gulp-babel');

var srcFiles      = ['src/**/*.js', '!src/**/templates/**/*.js']
  , templateFiles = 'src/**/templates/**/*.js';

gulp.task('default', function () {
    return gulp.src(srcFiles)
        .pipe(babel())
        .pipe(gulp.src(templateFiles))
        .pipe(gulp.dest('dist'));
});

gulp.task('watch', ['default'], function() {
  gulp.watch(srcFiles, ['default']);
});
