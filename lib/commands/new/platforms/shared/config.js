var require = {
  baseUrl: 'dist',
  deps: ['aurelia-bootstrapper'],
  paths: {
    "aurelia-binding": "../node_modules/aurelia-binding/dist/amd/aurelia-binding",
    "aurelia-bootstrapper": "../node_modules/aurelia-bootstrapper/dist/amd/aurelia-bootstrapper",
    "aurelia-dependency-injection": "../node_modules/aurelia-dependency-injection/dist/amd/aurelia-dependency-injection",
    "aurelia-event-aggregator": "../node_modules/aurelia-event-aggregator/dist/amd/aurelia-event-aggregator",
    "aurelia-framework": "../node_modules/aurelia-framework/dist/amd/aurelia-framework",
    "aurelia-history": "../node_modules/aurelia-history/dist/amd/aurelia-history",
    "aurelia-history-browser": "../node_modules/aurelia-history-browser/dist/amd/aurelia-history-browser",
    "aurelia-loader": "../node_modules/aurelia-loader/dist/amd/aurelia-loader",
    "aurelia-loader-default": "../node_modules/aurelia-loader-default/dist/amd/aurelia-loader-default",
    "aurelia-logging": "../node_modules/aurelia-logging/dist/amd/aurelia-logging",
    "aurelia-logging-console": "../node_modules/aurelia-logging-console/dist/amd/aurelia-logging-console",
    "aurelia-metadata": "../node_modules/aurelia-metadata/dist/amd/aurelia-metadata",
    "aurelia-pal": "../node_modules/aurelia-pal/dist/amd/aurelia-pal",
    "aurelia-pal-browser": "../node_modules/aurelia-pal-browser/dist/amd/aurelia-pal-browser",
    "aurelia-path": "../node_modules/aurelia-path/dist/amd/aurelia-path",
    "aurelia-polyfills": "../node_modules/aurelia-polyfills/dist/amd/aurelia-polyfills",
    "aurelia-route-recognizer": "../node_modules/aurelia-route-recognizer/dist/amd/aurelia-route-recognizer",
    "aurelia-router": "../node_modules/aurelia-router/dist/amd/aurelia-router",
    "aurelia-task-queue": "../node_modules/aurelia-task-queue/dist/amd/aurelia-task-queue",
    "aurelia-templating": "../node_modules/aurelia-templating/dist/amd/aurelia-templating",
    "aurelia-templating-binding": "../node_modules/aurelia-templating-binding/dist/amd/aurelia-templating-binding",
    "text": "../aurelia_project/modules/text"
  },
  packages: [
    {
      name: 'aurelia-templating-resources',
      location: '../node_modules/aurelia-templating-resources/dist/amd',
      main : 'aurelia-templating-resources'
    },
    {
      name: 'aurelia-templating-router',
      location: '../node_modules/aurelia-templating-router/dist/amd',
      main : 'aurelia-templating-router'
    }
  ],
};
