let gulp = require('gulp');
let plumber = require('gulp-plumber');
let notify = require('gulp-notify');
let changed = require('gulp-changed');
let sourcemaps = require('gulp-sourcemaps');
let typescript = require('gulp-tsb');
let rename = require('gulp-rename');
let project = require('../aurelia.json');
let {inject} = require('aurelia-dependency-injection');
let {CLIOptions} = require('aurelia-cli');

@inject(CLIOptions)
class ConfigureEnvironment {
  constructor(private options: CLIOptions) { }

  execute() {
    let env = this.options.getFlag('env') || process.env.NODE_ENV || 'dev';

    return gulp.src(`aurelia_project/environments/${env}.ts`)
      .pipe(rename('environment.js'))
      .pipe(gulp.dest(project.paths.root));
  }
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
  ConfigureEnvironment,
  buildJavaScript
);
