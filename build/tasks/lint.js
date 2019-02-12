const gulp = require('gulp');
const eslint = require('gulp-eslint');

gulp.task('lint', function() {
  return gulp.src(['lib/**/*.js', 'spec/**/*.js'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failOnError());
});
