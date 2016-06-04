import gulp from 'gulp';
import changed from 'gulp-changed';
import plumber from 'gulp-plumber';
import babel from 'gulp-babel';
import sourcemaps from 'gulp-sourcemaps';
import notify from 'gulp-notify';
import rename from 'gulp-rename';
import project from '../aurelia.json';
import {CLIOptions} from 'aurelia-cli';

function configureEnvironment() {
  let env = CLIOptions.getEnvironment();

  return gulp.src(`aurelia_project/environments/${env}.js`)
    .pipe(rename('environment.js'))
    .pipe(gulp.dest(project.paths.root));
}

function buildJavaScript() {
  return gulp.src(project.paths.source)
    .pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')}))
    .pipe(changed(project.paths.output, {extension: '.js'}))
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(babel({
      plugins: [
        'transform-es2015-modules-amd'
      ]
    }))
    .pipe(sourcemaps.write({includeContent: false, sourceRoot: '/src'}))
    .pipe(gulp.dest(project.paths.output));
}

export default gulp.series(
  configureEnvironment,
  buildJavaScript
);
