import gulp from 'gulp';
import {CLIOptions} from 'aurelia-cli';
import transpile from './transpile';
import processMarkup from './process-markup';
import processCSS from './process-css';
import {build} from 'aurelia-cli';
import project from '../aurelia.json';

let buildTask = gulp.series(
  readProjectConfiguration,
  gulp.parallel(
    transpile,
    processMarkup,
    processCSS
  ),
  writeBundles
);

function onChange(path) {
  console.log(`File Changed: ${path}`);
}

function readProjectConfiguration() {
  return build.src(project);
}

function writeBundles() {
  return build.dest();
}

let watch = function() {
  gulp.watch(project.transpiler.source, buildTask).on('change', onChange);
  gulp.watch(project.markupProcessor.source, buildTask).on('change', onChange);
  gulp.watch(project.cssProcessor.source, buildTask).on('change', onChange)
}

let task;

if (CLIOptions.hasFlag('watch')) {
  task = gulp.series(
    buildTask,
    watch
  );
} else {
  task = buildTask;
}

export default task;