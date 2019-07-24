import gulp from 'gulp';
import plumber from 'gulp-plumber';
import babel from 'gulp-babel';
import notify from 'gulp-notify';
import rename from 'gulp-rename';
import cache from 'gulp-cache';
import project from '../aurelia.json';
import fs from 'fs';
import through from 'through2';
import { CLIOptions, build, Configuration } from 'aurelia-cli';
// @if feat.plugin
import * as gulpSourcemaps from 'gulp-sourcemaps';
// @endif

let env = CLIOptions.getEnvironment();
const buildOptions = new Configuration(project.build.options);
const useCache = buildOptions.isApplicable('cache');

function configureEnvironment() {
  return gulp.src(`aurelia_project/environments/${env}.js`, {
      since: gulp.lastRun(configureEnvironment)
    })
    .pipe(rename('environment.js'))
    .pipe(through.obj(function (file, _, cb) {
      // https://github.com/aurelia/cli/issues/1031
      fs.unlink(`${project.paths.root}/${file.relative}`, function () {
        cb(null, file);
      });
    }))
    .pipe(gulp.dest(project.paths.root));
}

function buildJavaScript() {
  let transpile = babel(project.transpiler.options);
  if (useCache) {
    // the cache directory is "gulp-cache/projName-env" inside folder require('os').tmpdir()
    // use command 'au clear-cache' to purge all caches
    transpile = cache(transpile, {
      name: project.name + '-' + env
    });
  }

  return gulp.src(project.transpiler.source, {
      sourcemaps: true,
      since: gulp.lastRun(buildJavaScript)
    })
    .pipe(plumber({
      errorHandler: notify.onError('Error: <%= error.message %>')
    }))
    .pipe(transpile)
    .pipe(build.bundle());
}

export default gulp.series(
  configureEnvironment,
  buildJavaScript
);

// @if feat.plugin
export function buildPluginJavaScript(dest, format) {
  return function processPluginJavaScript() {
    let opts = {};
    if (format === 'commonjs') {
      opts = {
        plugins: [
          ['@babel/plugin-transform-modules-commonjs', {
            loose: true
          }]
        ]
      };
    }
    const transpile = babel(opts);

    return gulp.src(project.plugin.source.js)
      .pipe(gulpSourcemaps.init())
      .pipe(transpile)
      .pipe(gulpSourcemaps.write('.', {
        includeContent: false,
        sourceRoot: '../../src/'
      }))
      .pipe(gulp.dest(dest));
  };
}
// @endif
