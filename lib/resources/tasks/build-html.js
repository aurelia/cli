import gulp from 'gulp';
import changed from 'gulp-changed';
import project from '../aurelia.json';

export default function buildHTML() {
  return gulp.src(project.paths.html)
    .pipe(changed(project.paths.output, {extension: '.html'}))
    .pipe(gulp.dest(project.paths.output));
}
