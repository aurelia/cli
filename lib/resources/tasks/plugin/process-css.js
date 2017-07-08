import gulp from 'gulp';
import changedInPlace from 'gulp-changed-in-place';
import path from 'path';
import project from '../aurelia.json';

export default function processCSS() {
  let result = gulp.src(project.cssProcessor.source)
    .pipe(changedInPlace({firstPass: true}));
  for (const outputType in project.transpiler.outputs) {
    result = result.pipe(gulp.dest(path.join(project.paths.output, outputType)));
  }
  return result;
}
