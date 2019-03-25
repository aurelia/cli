import gulp from 'gulp';
import plumber from 'gulp-plumber';
import babel from 'gulp-babel';
import notify from 'gulp-notify';
import rename from 'gulp-rename';
import cache from 'gulp-cache';
import project from '../aurelia.json';
import {CLIOptions, build, Configuration} from 'aurelia-cli';

let env = CLIOptions.getEnvironment();
const buildOptions = new Configuration(project.build.options);
const useCache = buildOptions.isApplicable('cache');

function configureEnvironment() {
  return gulp.src(`aurelia_project/environments/${env}.js`, {since: gulp.lastRun(configureEnvironment)})
    .pipe(rename('environment.js'))
    .pipe(gulp.dest(project.paths.root));
}

function buildJavaScript() {
  let transpile = babel(project.transpiler.options);
  if (useCache) {
    // the cache directory is "gulp-cache/projName-env" inside folder require('os').tmpdir()
    // use command 'au clear-cache' to purge all caches
    transpile = cache(transpile, {name: project.name + '-' + env});
  }

  return gulp.src(project.transpiler.source, {sourcemaps: true, since: gulp.lastRun(buildJavaScript)})
    .pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')}))
    .pipe(transpile)
    .pipe(build.bundle());
}

export default gulp.series(
  configureEnvironment,
  buildJavaScript
);
