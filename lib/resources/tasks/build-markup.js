import gulp from 'gulp';
import changedInPlace from 'gulp-changed-in-place';
import project from '../aurelia.json';
import {build} from 'aurelia/cli';

export default function buildHTML() {
  return gulp.src(project.paths.markup)
    .pipe(changedInPlace({firstPass:true}))
    .pipe(build.bundle());
}
