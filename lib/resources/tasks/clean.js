import gulp from 'gulp';
import del from 'del';
import vinylPaths from 'vinyl-paths';
import project from '../aurelia.json';

export default function clean() {
  return gulp.src([project.paths.output], { allowEmpty: true })
    .pipe(vinylPaths(del));
}
