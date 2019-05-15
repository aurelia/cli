// @if feat.babel
import gulp from 'gulp';
import del from 'del';
// @endif
// @if feat.typescript
import * as gulp from 'gulp';
import * as del from 'del';
// @endif

function clearDist() {
  return del([config.output.path]);
}

gulp.task("prebuild", gulp.series(
  clearDist,
  configureEnvironment
));
