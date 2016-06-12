import * as gulp from 'gulp';
import * as changedInPlace from 'gulp-changed-in-place';
import * as project from '../aurelia.json';
import {build} from 'aurelia-cli';

export default function buildStyles() {
  return gulp.src(project.paths.styles)
    .pipe(changedInPlace({firstPass:true}))
    .pipe(build.bundle());
};
