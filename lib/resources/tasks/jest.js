import jest from 'jest-cli';
import PluginError from 'plugin-error';
import path from 'path';
import packageJson from '../../package.json';
import {CLIOptions} from 'aurelia-cli';

export default (cb) => {
  let options = packageJson.jest;

  if (CLIOptions.hasFlag('watch')) {
    Object.assign(options, { watch: true});
  }

  process.env.BABEL_TARGET = 'node';

  jest.runCLI(options, [path.resolve(__dirname, '../../')]).then((result) => {
    if (result.numFailedTests || result.numFailedTestSuites) {
      cb(new PluginError('gulp-jest', { message: 'Tests Failed' }));
    } else {
      cb();
    }
  });
};
