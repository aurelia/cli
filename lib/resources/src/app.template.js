export class App {
// @if features.navigation!='navigation'
  constructor() {
    this.message = 'Hello World!';
  }
// @endif
// @if features.navigation='navigation'
  configureRouter(config, router) {
    config.title = 'Aurelia';
    config.map([
      { route: ['', 'welcome'], name: 'welcome',      moduleId: /* @if bundler.id='webpack' ** PLATFORM.moduleName(/* @endif */ 'welcome'/* @if bundler.id='webpack' **)/* @endif */,      nav: true, title: 'Welcome' },
      { route: 'users',         name: 'users',        moduleId: /* @if bundler.id='webpack' ** PLATFORM.moduleName(/* @endif */ 'users'/* @if bundler.id='webpack' **)/* @endif */,        nav: true, title: 'Github Users' },
      { route: 'child-router',  name: 'child-router', moduleId: /* @if bundler.id='webpack' ** PLATFORM.moduleName(/* @endif */ 'child-router'/* @if bundler.id='webpack' **)/* @endif */, nav: true, title: 'Child Router' }
    ]);

    this.router = router;
  }
// @endif
}
