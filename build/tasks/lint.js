const gulp = require('gulp');
const eslint = require('gulp-eslint');

gulp.task('lint', function() {
  return gulp.src(['lib/**/*.js', 'spec/**/*.js', 'lib/**/*.ts', 'spec/**/*.ts'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failOnError());
});
