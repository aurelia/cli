const del = require('del');
const gulp = require('gulp');
const path = require('path');
const project = require('./aurelia_project/aurelia.json');

function clearDist() {
  return del([path.resolve(__dirname, project.platform.output)]);
}

gulp.task("prebuild", clearDist);