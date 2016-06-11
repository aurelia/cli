import * as gulp from 'gulp';
import * as changed from 'gulp-changed';
import * as plumber from 'gulp-plumber';
import * as sourcemaps from 'gulp-sourcemaps';
import * as notify from 'gulp-notify';
import * as rename from 'gulp-rename';
import * as typescript from 'gulp-tsb'; //switch to gulp-typescript fpr sourcemaps
import * as project from '../aurelia.json';
import {CLIOptions} from 'aurelia-cli';

function configureEnvironment() {
  let env = CLIOptions.getEnvironment();

  return gulp.src(`aurelia_project/environments/${env}.ts`)
    .pipe(rename('environment.js'))
    .pipe(gulp.dest(project.paths.root));
}

let typescriptCompiler = global.typescriptCompiler || null;

function buildJavaScript() {
  if (!typescriptCompiler) {
    typescriptCompiler = typescript.create(require('../../tsconfig.json').compilerOptions);
  }

  return gulp.src(project.paths.dtsSource.concat(project.paths.source))
    .pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')}))
    .pipe(changed(project.paths.output, {extension: '.js'}))
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(typescriptCompiler())
    .pipe(sourcemaps.write({includeContent: false, sourceRoot: '/src'}))
    .pipe(gulp.dest(project.paths.output));
}

export default gulp.series(
  configureEnvironment,
  buildJavaScript
);
