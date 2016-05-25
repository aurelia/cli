let gulp = require('gulp');
let clean = require('./clean');
import buildStyles from './build-styles';
import buildJavaScript from './build-javascript';
import buildMarkup from './build-markup';

export default gulp.series(
  clean,
  gulp.parallel(
    buildJavaScript,
    buildMarkup,
    buildStyles
  )
);
