import * as gulp from 'gulp';
import * as sourcemaps from 'gulp-sourcemaps';
import * as postcss from 'gulp-postcss';
import * as autoprefixer from 'autoprefixer';
import * as path from 'path';
import * as project from '../aurelia.json';

export default function processCSS() {
  const processors = [
    autoprefixer({ browsers: ['last 1 version'] })
  ];

  let result = gulp.src(project.cssProcessor.source)
    .pipe(sourcemaps.init())
    .pipe(postcss(processors))
    .pipe(sourcemaps.write());
  for (const outputType in project.transpiler.outputs) {
    result = result.pipe(gulp.dest(path.join(project.paths.output, outputType)));
  }
  return result;
}
