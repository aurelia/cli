import * as gulp from 'gulp';
import * as path from 'path';
import * as project from '../aurelia.json';

export default function processMarkup() {
  let result = gulp.src(project.markupProcessor.source);
  for (const outputType in project.transpiler.outputs) {
    result = result.pipe(gulp.dest(path.join(project.paths.output, outputType)));
  }
  return result;
}
