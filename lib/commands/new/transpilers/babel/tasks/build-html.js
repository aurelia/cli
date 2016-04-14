import gulp from 'gulp';
import changed from 'gulp-changed';
import config from '../config.json';

export default function buildHTML() {
  return gulp.src(config.paths.html)
    .pipe(changed(config.paths.output, {extension: '.html'}))
    .pipe(gulp.dest(config.paths.output));
}
