import gulp from 'gulp';
import sourcemaps from 'gulp-sourcemaps';
import stylus from 'gulp-stylus';
import path from 'path';
import project from '../aurelia.json';

export default function processCSS() {
  let result = gulp.src(project.cssProcessor.source)
    .pipe(sourcemaps.init())
    .pipe(stylus())
    .pipe(sourcemaps.write());
  for (const outputType in project.transpiler.outputs) {
    result = result.pipe(gulp.dest(path.join(project.paths.output, outputType)));
  }
  return result;
}
