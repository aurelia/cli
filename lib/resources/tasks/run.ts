import * as gulp from 'gulp';
import * as browserSync from 'browser-sync';
import * as project from '../aurelia.json';
import serve from './serve';
import buildJavaScript from './build-javascript';
import buildMarkup from './build-markup';
import buildStyles from './build-styles'

function onChange(event) {
  console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
  browserSync.reload();
}

export default gulp.series(
  serve,
  () => {
    gulp.watch(project.paths.source, buildJavaScript).on('change', onChange);
    gulp.watch(project.paths.markup, buildMarkup).on('change', onChange);
    gulp.watch(project.paths.styles, buildStyles).on('change', onChange);
  }
);
