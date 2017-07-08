import * as gulp from 'gulp';
import * as sourcemaps from 'gulp-sourcemaps';
import * as jade from 'gulp-jade';
import * as path from 'path';
import * as project from '../aurelia.json';

export default function processMarkup() {
  let result = gulp.src(project.markupProcessor.source)
    .pipe(sourcemaps.init())
    .pipe(jade())
    .pipe(sourcemaps.write());
  for (const outputType in project.transpiler.outputs) {
    result = result.pipe(gulp.dest(path.join(project.paths.output, outputType)));
  }
  return result;
}
