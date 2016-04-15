import gulp from 'gulp';
import browserSync from 'browser-sync';
import config from '../config.json';
import serve from './serve';
import buildJavaScript from './build-javascript';
import buildHTML from './build-html';
import buildStyles from './build-styles'

function onChange(event) {
  console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
  browserSync.reload();
}

export default gulp.series(
  serve,
  () => {
    gulp.watch(config.paths.source, buildJavaScript).on('change', onChange);
    gulp.watch(config.paths.html, buildHTML).on('change', onChange);
    gulp.watch(config.paths.styles, buildStyles).on('change', onChange);
  }
);
