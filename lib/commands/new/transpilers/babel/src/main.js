export function configure(aurelia) {
  aurelia.use
    .standardConfiguration()
    .developmentLogging()
    .plugin('resources');

  aurelia.start().then(() => aurelia.setRoot());
}
