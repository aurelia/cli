import gulp from 'gulp';
import changed from 'gulp-changed';
import plumber from 'gulp-plumber';
import babel from 'gulp-babel';
import sourcemaps from 'gulp-sourcemaps';
import notify from 'gulp-notify';
import browserSync from 'browser-sync';
import config from '../config.json';
import clean from './clean';
import buildStyles from './build-styles';

function buildJavaScript() {
  return gulp.src(config.paths.source)
    .pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')}))
    .pipe(changed(config.paths.output, {extension: '.js'}))
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(babel())
    .pipe(sourcemaps.write({includeContent: false, sourceRoot: '/src'}))
    .pipe(gulp.dest(config.paths.output));
};

function buildHTML() {
  return gulp.src(config.paths.html)
    .pipe(changed(config.paths.output, {extension: '.html'}))
    .pipe(gulp.dest(config.paths.output));
};

export default function build() {
  return gulp.series(
    clean,
    gulp.parallel(
      buildJavaScript,
      buildHTML,
      buildStyles
    )
  );
}
