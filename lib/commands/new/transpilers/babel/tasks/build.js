import gulp from 'gulp';
import clean from './clean';
import buildStyles from './build-styles';
import buildJavaScript from './build-javascript';
import buildHTML from './build-html';

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
