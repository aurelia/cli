import {Aurelia} from 'aurelia-framework'
import environment from './environment';
// @if features.bootstrap='bootstrap'
import 'bootstrap';
// @endif

export function configure(aurelia: Aurelia) {
  aurelia.use
    .standardConfiguration()
    .feature('resources');

  if (environment.debug) {
    aurelia.use.developmentLogging();
  }

  if (environment.testing) {
    aurelia.use.plugin('aurelia-testing');
  }

// @if features.navigation='navigation'
  // Uncomment the line below to enable animation.
  // aurelia.use.plugin('aurelia-animator-css');

  // Anyone wanting to use HTMLImports to load views, will need to install the following plugin.
  // aurelia.use.plugin('aurelia-html-import-template-loader')

// @endif
  aurelia.start().then(() => aurelia.setRoot());
}
