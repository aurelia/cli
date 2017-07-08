import gulp from 'gulp';
import htmlmin from 'gulp-htmlmin';
import plumber from 'gulp-plumber';
import notify from 'gulp-notify';
import path from 'path';
import project from '../aurelia.json';

export default function processMarkup() {
  let result = gulp.src(project.markupProcessor.source)
    .pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')}))
    .pipe(htmlmin({
        removeComments: true,
        collapseWhitespace: true,
        minifyCSS: true,
        minifyJS: true,
        ignoreCustomFragments: [/\${.*?}/g] // ignore interpolation expressions
    }))
  for (const outputType in project.transpiler.outputs) {
    result = result.pipe(gulp.dest(path.join(project.paths.output, outputType)));
  }
  return result;
}
