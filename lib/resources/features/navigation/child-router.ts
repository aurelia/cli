import {Router, RouterConfiguration} from 'aurelia-router';

export class ChildRouter {
  public heading = 'Child Router';
  public router: Router;

  public configureRouter(config: RouterConfiguration, router: Router) {
    config.map([
      { route: ['', 'welcome'], name: 'welcome',       moduleId: /* @if bundler.id='webpack' ** './welcome'/* @endif *//* @if bundler.id!='webpack' */ 'welcome'/* @endif */,       nav: true, title: 'Welcome' },
      { route: 'users',         name: 'users',         moduleId: /* @if bundler.id='webpack' ** './users'/* @endif *//* @if bundler.id!='webpack' */ 'users'/* @endif */,         nav: true, title: 'Github Users' },
      { route: 'child-router',  name: 'child-router',  moduleId: /* @if bundler.id='webpack' ** './child-router'/* @endif *//* @if bundler.id!='webpack' */ 'child-router'/* @endif */,  nav: true, title: 'Child Router' }
    ]);

    this.router = router;
  }
}
