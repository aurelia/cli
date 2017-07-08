import gulp from 'gulp';
import sourcemaps from 'gulp-sourcemaps';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import path from 'path';
import project from '../aurelia.json';

export default function processCSS() {
  let processors = [
    autoprefixer({browsers: ['last 1 version']})
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
