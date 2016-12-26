import * as gulp from 'gulp';
import * as htmlmin from 'gulp-htmlmin';
import * as changedInPlace from 'gulp-changed-in-place';
import * as project from '../aurelia.json';
import {build} from 'aurelia-cli';

export default function processMarkup() {
  return gulp.src(project.markupProcessor.source)
    .pipe(changedInPlace({firstPass:true}))
    .pipe(htmlmin({
        removeComments: true,
        collapseWhitespace: true,
        minifyCSS: true,
        minifyJS: true
    }))
    .pipe(build.bundle());
}