import gulp from 'gulp';
import plumber from 'gulp-plumber';
import notify from 'gulp-notify';
import sourcemaps from 'gulp-sourcemaps';
import babel from 'gulp-babel';
import path from 'path';
import project from '../aurelia.json';

function transpileFor(outputType) {
  return gulp.src(project.transpiler.source)
    .pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')}))
    .pipe(sourcemaps.init())
    .pipe(babel(outputType.options.compileOptions || {}))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(path.join(project.paths.output, outputType.name)));
}

const outputTypes = Object.keys(project.transpiler.outputs).map(name => ({
  name,
  taskName: `transpile-${name}`,
  options: project.transpiler.outputs[name] || {}
}));

function registerTranspileTasks() {
  outputTypes.forEach(x => gulp.task(x.taskName, () => transpileFor(x)));
}



registerTranspileTasks();

export default gulp.parallel(
  ...outputTypes.map(x => x.taskName)
);
