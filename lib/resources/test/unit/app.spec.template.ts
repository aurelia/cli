import {App} from '../../src/app';

// @if features.navigation!='navigation'
describe('the app', () => {
  it('says hello', () => {
    expect(new App().message).toBe('Hello World!');
  });
});
// @endif

// @if features.navigation='navigation'
class RouterStub {
  routes;
  
  configure(handler) {
    handler(this);
  }
  
  map(routes) {
    this.routes = routes;
  }
}

describe('the App module', () => {
  var sut, mockedRouter;

  beforeEach(() => {
    mockedRouter = new RouterStub();
    sut = new App();
    sut.configureRouter(mockedRouter, mockedRouter);
  });

  it('contains a router property', () => {
    expect(sut.router).toBeDefined();
  });

  it('configures the router title', () => {
    expect(sut.router.title).toEqual('Aurelia');
  });

  it('should have a welcome route', () => {
    expect(sut.router.routes).toContain/* @if unitTestRunner.id='jest' **Equal/* @endif */({ route: ['','welcome'], name: 'welcome',  moduleId: 'welcome', nav: true, title:'Welcome' });
  });

  it('should have a users route', () => {
     expect(sut.router.routes).toContain/* @if unitTestRunner.id='jest' **Equal/* @endif */({ route: 'users', name: 'users', moduleId: 'users', nav: true, title:'Github Users' });
  });

  it('should have a child router route', () => {
    expect(sut.router.routes).toContain/* @if unitTestRunner.id='jest' **Equal/* @endif */({ route: 'child-router', name: 'child-router', moduleId: 'child-router', nav: true, title:'Child Router' });
  });
});
// @endif
