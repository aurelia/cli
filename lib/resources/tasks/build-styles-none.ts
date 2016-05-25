let gulp = require('gulp');
let changed = require('gulp-changed');
let project = require('../aurelia.json');

export default function buildStyles() {
  return gulp.src(project.paths.styles)
    .pipe(changed(project.paths.output, {extension: '.css'}))
    .pipe(gulp.dest(project.paths.output));
};
