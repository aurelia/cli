import * as cypress from 'cypress';
import { CLIOptions } from 'aurelia-cli';
import * as config from '../../cypress.config';

export default (resolve) => {
  if (CLIOptions.hasFlag('run')) {
    cypress
      .run(config)
      .then(results => (results.totalFailed === 0 ? resolve() : resolve('Run failed!')))
      .catch(resolve);
  } else {
    cypress.open(config);
  }
};
