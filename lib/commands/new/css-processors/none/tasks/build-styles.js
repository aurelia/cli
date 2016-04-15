import gulp from 'gulp';
import changed from 'gulp-changed';
import project from '../aurelia.json';

export default function buildStyles() {
  return gulp.src(project.paths.styles)
    .pipe(changed(project.paths.output, {extension: '.css'}))
    .pipe(gulp.dest(project.paths.output));
};
