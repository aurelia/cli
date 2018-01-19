// @if bundler.id='webpack'
import {Aurelia} from 'aurelia-framework';
import {PLATFORM} from 'aurelia-pal';
// @endif
// @if features.navigation='navigation'
import {Router, RouterConfiguration} from 'aurelia-router';

// @endif
export class App {
// @if features.navigation!='navigation'
  public message: string = 'Hello World!';
// @endif
// @if features.navigation='navigation'
  public router: Router;

  public configureRouter(config: RouterConfiguration, router: Router) {
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
