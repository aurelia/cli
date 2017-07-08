import gulp from 'gulp';
import plumber from 'gulp-plumber';
import notify from 'gulp-notify';
import sourcemaps from 'gulp-sourcemaps';
import less from 'gulp-less';
import path from 'path';
import project from '../aurelia.json';

export default function processCSS() {
  let result = gulp.src(project.cssProcessor.source)
    .pipe(plumber({ errorHandler: notify.onError('Error: <%= error.message %>') }))
    .pipe(sourcemaps.init())
    .pipe(less())
    .pipe(sourcemaps.write());
  for (const outputType in project.transpiler.outputs) {
    result = result.pipe(gulp.dest(path.join(project.paths.output, outputType)));
  }
  return result;
}
