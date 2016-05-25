import * as gulp from 'gulp';
import * as changed from 'gulp-changed';
import * as sourcemaps from 'gulp-sourcemaps';
import * as postcss from 'gulp-postcss';
import * as autoprefixer from 'autoprefixer';
import * as project from '../aurelia.json';

export default function buildStyles() {
  let processors = [
    autoprefixer({browsers: ['last 1 version']})
  ];

  return gulp.src(project.paths.styles)
    .pipe(changed(project.paths.output, {extension: '.css'}))
    .pipe(sourcemaps.init())
    .pipe(postcss(processors))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(project.paths.output));
};
