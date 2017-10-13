import * as jest from 'jest-cli';
import * as gutil from 'gulp-util';
import through2 from 'through2';
import * as path from 'path';
import * as packageJson from '../../package.json';
import {CLIOptions} from 'aurelia-cli';

export default (cb) => {
  let options = packageJson.jest;
  
  if (CLIOptions.hasFlag('watch')) {
    Object.assign(options, { watch: true});
  }

  jest.runCLI(options, [path.resolve(__dirname, '../../')], (result) => {
    if(result.numFailedTests || result.numFailedTestSuites) {
      cb(new gutil.PluginError('gulp-jest', { message: 'Tests Failed' }));
    } else {
      cb();
    }
  });
};