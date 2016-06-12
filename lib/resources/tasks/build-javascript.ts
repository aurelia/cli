import * as gulp from 'gulp';
import * as changedInPlace from 'gulp-changed-in-place';
import * as plumber from 'gulp-plumber';
import * as sourcemaps from 'gulp-sourcemaps';
import * as notify from 'gulp-notify';
import * as rename from 'gulp-rename';
import * as ts from 'gulp-typescript';
import * as project from '../aurelia.json';
import {CLIOptions, build} from 'aurelia-cli';

function configureEnvironment() {
  let env = CLIOptions.getEnvironment();

  return gulp.src(`aurelia_project/environments/${env}.ts`)
    .pipe(changedInPlace({firstPass:true}))
    .pipe(rename('environment.js'))
    .pipe(gulp.dest(project.paths.root));
}

var tsProject = ts.createProject('../../tsconfig.json');

function buildJavaScript() {
  return gulp.src(project.paths.dtsSource.concat(project.paths.source))
    .pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')}))
    .pipe(changedInPlace({firstPass:true}))
    .pipe(sourcemaps.init())
    .pipe(ts(tsProject))
    .pipe(build.bundle());
}

export default gulp.series(
  configureEnvironment,
  buildJavaScript
);
