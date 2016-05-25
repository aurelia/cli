let gulp = require('gulp');
let changed = require('gulp-changed');
let project = require('../aurelia.json');

export default function buildMarkup() {
  return gulp.src(project.paths.markup)
    .pipe(changed(project.paths.output, {extension: '.html'}))
    .pipe(gulp.dest(project.paths.output));
}
