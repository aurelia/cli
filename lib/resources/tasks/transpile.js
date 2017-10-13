import gulp from 'gulp';
import changedInPlace from 'gulp-changed-in-place';
import plumber from 'gulp-plumber';
import babel from 'gulp-babel';
import sourcemaps from 'gulp-sourcemaps';
import notify from 'gulp-notify';
import rename from 'gulp-rename';
import project from '../aurelia.json';
import {CLIOptions, build} from 'aurelia-cli';

function buildJavaScript() {
  let env = CLIOptions.getEnvironment();

  return gulp.src(`aurelia_project/environments/${env}.js`)
    .pipe(rename(`../../${project.paths.root}/environment.js`))
    .pipe(gulp.src(project.transpiler.source, { passthrough: true }))
    .pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')}))
    .pipe(changedInPlace({firstPass: true}))
    .pipe(sourcemaps.init())
    .pipe(babel(project.transpiler.options))
    .pipe(build.bundle());
}

export default gulp.series(
  buildJavaScript
);
