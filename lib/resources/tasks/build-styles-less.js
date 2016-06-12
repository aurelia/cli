import gulp from 'gulp';
import changedInPlace from 'gulp-changed-in-place';
import sourcemaps from 'gulp-sourcemaps';
import less from 'gulp-less';
import project from '../aurelia.json';
import {build} from 'aurelia-cli';

export default function buildStyles() {
  gulp.src(project.paths.styles)
    .pipe(changedInPlace({firstPass:true}))
    .pipe(sourcemaps.init())
    .pipe(less())
    .pipe(build.bundle());
};
