import gulp from 'gulp';
import sourcemaps from 'gulp-sourcemaps';
import sass from 'gulp-sass';
import project from '../aurelia.json';
import {build} from 'aurelia-cli';

export default function buildStyles() {
  return gulp.src(project.paths.styles)
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(build.bundle());
};
