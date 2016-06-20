import * as gulp from 'gulp';
import * as changedInPlace from 'gulp-changed-in-place';
import * as sourcemaps from 'gulp-sourcemaps';
import * as stylus from 'gulp-stylus';
import * as project from '../aurelia.json';
import {build} from 'aurelia-cli';

export default function processCSS() {
  return gulp.src(project.cssProcessor.source)
    .pipe(changedInPlace({firstPass:true}))
    .pipe(sourcemaps.init())
    .pipe(stylus())
    .pipe(build.bundle());
};
