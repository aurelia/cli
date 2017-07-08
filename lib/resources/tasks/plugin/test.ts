import {Server as Karma} from 'karma';
import {CLIOptions} from 'aurelia-cli';
import * as path from 'path';

export default function test(done) {
  new Karma({
    configFile: path.join(__dirname, '/../../test/karma.conf.js'),
    singleRun: !CLIOptions.hasFlag('watch')
  }, function(exitCode) {
    console.log('Karma has exited with ' + exitCode);
    process.exit(exitCode);
  }).start();
}
