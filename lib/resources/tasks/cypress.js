import cypress from 'cypress';
import { CLIOptions } from 'aurelia-cli';
import config from '../../cypress.config';

export default () => {
  if (CLIOptions.hasFlag('run')) {
    cypress.run(config);
  } else {
    cypress.open(config);
  }
};
