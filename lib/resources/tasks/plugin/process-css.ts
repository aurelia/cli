import * as gulp from 'gulp';
import * as path from 'path';
import * as project from '../aurelia.json';

export default function processCSS() {
  let result = gulp.src(project.cssProcessor.source);
  for (const outputType in project.transpiler.outputs) {
    result = result.pipe(gulp.dest(path.join(project.paths.output, outputType)));
  }
  return result;
}
