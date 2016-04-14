import gulp from 'gulp';
import del from 'del';
import vinylPaths from 'vinyl-paths';
import config from '../config.json';

export default function clean() {
  return gulp.src([config.paths.output])
    .pipe(vinylPaths(del));
});
