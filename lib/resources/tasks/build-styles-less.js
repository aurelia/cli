import gulp from 'gulp';
import changed from 'gulp-changed';
import sourcemaps from 'gulp-sourcemaps';
import less from 'gulp-less';
import project from '../aurelia.json';

export default function buildStyles() {
  gulp.src(project.paths.styles)
    .pipe(changed(project.paths.output, {extension: '.css'}))
    .pipe(sourcemaps.init())
    .pipe(less())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(project.paths.output));
};
