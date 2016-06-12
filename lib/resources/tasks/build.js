import gulp from 'gulp';
import buildStyles from './build-styles';
import buildJavaScript from './build-javascript';
import buildMarkup from './build-markup';
import {build} from 'aurelia-cli';
import project from '../aurelia.json';

export default gulp.series(
  startBundling,
  gulp.parallel(
    buildJavaScript,
    buildMarkup,
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
