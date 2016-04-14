import gulp from 'gulp';
import changed from 'gulp-changed';
import plumber from 'gulp-plumber';
import babel from 'gulp-babel';
import sourcemaps from 'gulp-sourcemaps';
import notify from 'gulp-notify';
import config from '../config.json';

export default function buildJavaScript() {
  return gulp.src(config.paths.source)
    .pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')}))
    .pipe(changed(config.paths.output, {extension: '.js'}))
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(babel({
      plugins: [
        'transform-es2015-modules-amd'
      ]
    }))
    .pipe(sourcemaps.write({includeContent: false, sourceRoot: '/src'}))
    .pipe(gulp.dest(config.paths.output));
}
