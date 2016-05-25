import * as gulp from 'gulp';
import * as changed from 'gulp-changed';
import * as sourcemaps from 'gulp-sourcemaps';
import * as stylus from 'gulp-stylus';
import * as project from '../aurelia.json';

export default function buildStyles() {
  return gulp.src(project.paths.styles)
    .pipe(changed(project.paths.output, {extension: '.css'}))
    .pipe(sourcemaps.init())
    .pipe(stylus())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(project.paths.output));
};
