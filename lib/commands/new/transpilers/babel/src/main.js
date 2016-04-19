export function configure(aurelia) {
  aurelia.use
    .standardConfiguration()
    .developmentLogging()
    .feature('resources');

  aurelia.start().then(() => aurelia.setRoot());
}
