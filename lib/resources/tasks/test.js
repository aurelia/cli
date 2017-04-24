import gulp from 'gulp';
import {Server as Karma} from 'karma';
import {CLIOptions} from 'aurelia-cli';
import build from './build';
import {watch} from './run';
import * as path from 'path';

function log(message) {
  console.log(message); //eslint-disable-line no-console
}

function onChange(path) {
  log(`File Changed: ${path}`);
}

let karma = done => {
  new Karma({
    configFile: path.join(__dirname, '/../../karma.conf.js'),
    singleRun: !CLIOptions.hasFlag('watch')
  }, done).start();
};

let unit;

if (CLIOptions.hasFlag('watch')) {
  unit = gulp.series(
    build,
    gulp.parallel(
      watch(build, onChange),
      karma
    )
  );
} else {
  unit = gulp.series(
    build,
    karma
  );
}

export default unit;
