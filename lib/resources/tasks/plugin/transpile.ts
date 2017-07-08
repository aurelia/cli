import * as gulp from 'gulp';
import * as plumber from 'gulp-plumber';
import * as sourcemaps from 'gulp-sourcemaps';
import * as notify from 'gulp-notify';
import * as ts from 'gulp-typescript';
import * as typescript from 'typescript';
import * as eventStream from 'event-stream';
import { CLIOptions } from 'aurelia-cli';
import * as path from 'path';
import * as project from '../aurelia.json';

interface OutputType {
  name: string;
  taskName: string;
  options: { compileOptions?: Partial<ts.Settings> }
}

function transpileFor(outputType: OutputType) {
  const compileOptions: ts.Settings = Object.assign({
    typescript,
    declaration: true
  }, outputType.options.compileOptions || {});

  const compile = ts.createProject('tsconfig.json', compileOptions);
  const dts: any = gulp.src(project.transpiler.dtsSource);
  const src: any = gulp.src(project.transpiler.source);
  return eventStream.merge(dts, src)
    .pipe(plumber({ errorHandler: notify.onError('Error: <%= error.message %>') }))
    .pipe(sourcemaps.init())
    .pipe(compile())
    .pipe(sourcemaps.write({ sourceRoot: project.paths.root }))
    .pipe(gulp.dest(path.join(project.paths.output, outputType.name)));
}

const outputTypes = Object.keys(project.transpiler.outputs).map(name => ({
  name,
  taskName: `transpile-${name}`,
  options: project.transpiler.outputs[name] || {}
} as OutputType));


function registerTranspileModules() {
  outputTypes.forEach(x => gulp.task(x.taskName,() => transpileFor(x)));
}



registerTranspileModules();

const transpile: any = gulp.parallel(
  ...outputTypes.map(x => x.taskName)
);

export { transpile as default };
