let gulp = require('gulp');
let changed = require('gulp-changed');
let sourcemaps = require('gulp-sourcemaps');
let less = require('gulp-less');
let project = require('../aurelia.json');

export default function buildStyles() {
  gulp.src(project.paths.styles)
    .pipe(changed(project.paths.output, {extension: '.css'}))
    .pipe(sourcemaps.init())
    .pipe(less())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(project.paths.output));
};
