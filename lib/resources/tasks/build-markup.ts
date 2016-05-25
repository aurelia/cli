import * as gulp from 'gulp';
import * as changed from 'gulp-changed';
import * as project from '../aurelia.json';

export default function buildMarkup() {
  return gulp.src(project.paths.markup)
    .pipe(changed(project.paths.output, {extension: '.html'}))
    .pipe(gulp.dest(project.paths.output));
}
