import gulp from 'gulp';
import { CLIOptions } from 'aurelia-cli';
import clean from './clean';
import transpile from './transpile';
import processMarkup from './process-markup';
import processCSS from './process-css';
import copyFiles from './copy-files';
import watch from './watch';

const build = gulp.series(
  clean,
  gulp.parallel(
    transpile,
    processMarkup,
    processCSS
  )
);


let main;

if (CLIOptions.taskName() === 'build' && CLIOptions.hasFlag('watch')) {
  main = gulp.series(
    build,
    (done) => { watch(); done(); }
  );
} else {
  main = build;
}

export { main as default };
