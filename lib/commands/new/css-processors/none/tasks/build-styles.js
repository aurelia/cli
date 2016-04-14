import gulp from 'gulp';
import changed from 'gulp-changed';
import browserSync from 'browser-sync';
import config from '../config.json';

export default function buildStyles() {
  return gulp.src(config.paths.styles)
    .pipe(changed(config.paths.output, {extension: '.css'}))
    .pipe(gulp.dest(config.paths.output))
    .pipe(browserSync.stream());
};
