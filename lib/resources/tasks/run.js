import gulp from 'gulp';
import browserSync from 'browser-sync';
import project from '../aurelia.json';
import serve from './serve';
import build from './build';

function onChange(path) {
  console.log(`File Changed: ${path}`);
}

function reload(done) {
  browserSync.reload();
  done();
}

let refresh = gulp.series(
  build,
  reload
);

export default gulp.series(
  serve,
  () => {
    gulp.watch(project.transpiler.source, refresh).on('change', onChange);
    gulp.watch(project.markupProcessor.source, refresh).on('change', onChange);
    gulp.watch(project.cssProcessor.source, refresh).on('change', onChange);
  }
);
