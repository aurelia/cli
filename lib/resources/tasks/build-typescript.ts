import gulp from 'gulp';
import plumber from 'gulp-plumber';
import notify from 'gulp-notify';
import changed from 'gulp-changed';
import sourcemaps from 'gulp-sourcemaps';
import typescript from 'gulp-tsb';
import rename from 'gulp-rename';
import project from '../aurelia.json';
import {inject} from 'aurelia-dependency-injection';
import {CLIOptions} from 'aurelia-cli';

@inject(CLIOptions)
class ConfigureEnvironment {
  constructor(options) {
    this.options = options;
  }

  execute() {
    let env = this.options.getFlag('env') || process.env.NODE_ENV || 'dev';

    return gulp.src(`aurelia_project/environments/${env}.js`)
      .pipe(rename('environment.js'))
      .pipe(gulp.dest(project.paths.root));
  }
}

let typescriptCompiler = typescriptCompiler || null;

function buildJavaScript() {
  if (!typescriptCompiler) {
    typescriptCompiler = typescript.create(require('../../tsconfig.json').compilerOptions);
  }

  return gulp.src(project.paths.dtsSrc.concat(project.paths.source))
    .pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')}))
    .pipe(changed(project.paths.output, {extension: '.js'}))
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(typescriptCompiler())
    .pipe(sourcemaps.write({includeContent: false, sourceRoot: '/src'}))
    .pipe(gulp.dest(project.paths.output));
}

export default gulp.series(
  ConfigureEnvironment,
  buildJavaScript
);
