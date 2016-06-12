import * as gulp from 'gulp';
import buildStyles from './build-styles';
import buildJavaScript from './build-javascript';
import buildMarkup from './build-markup';
import build from 'aurelia-cli';
import * as project from '../aurelia.json';

export default gulp.series(
  startBundling,
  gulp.parallel(
    buildJavaScript,
    buildHTML,
    buildStyles
  ),
  endBundling
);

function startBundling() {
  return build.src(project);
}

function endBundling() {
  return build.dest();
}
