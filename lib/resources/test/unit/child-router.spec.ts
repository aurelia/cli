import {ChildRouter} from '../../src/child-router';

class RouterStub {
  routes;
  
  configure(handler) {
    handler(this);
  }
  map(routes) {
    this.routes = routes;
  }
}

describe('the Child Router module', () => {
  var sut, mockedRouter;

  beforeEach(() => {
    mockedRouter = new RouterStub();
    sut = new ChildRouter();
    sut.configureRouter(mockedRouter, mockedRouter);
  });

  it('contains a router property', () => {
    expect(sut.router).toBeDefined();
  });

  it('configures the heading', () => {
    expect(sut.heading).toEqual('Child Router');
  });

  it('should have a welcome route', () => {
    expect(sut.router.routes).toContain/* @if unitTestRunner.id='jest' **Equal/* @endif */({ route: ['','welcome'], name: 'welcome',  moduleId: '/* @if bundler.id='webpack' **.//* @endif */welcome', nav: true, title:'Welcome' });
  });

  it('should have a users route', () => {
     expect(sut.router.routes).toContain/* @if unitTestRunner.id='jest' **Equal/* @endif */({ route: 'users', name: 'users', moduleId: '/* @if bundler.id='webpack' **.//* @endif */users', nav: true, title:'Github Users' });
  });

  it('should have a child router route', () => {
    expect(sut.router.routes).toContain/* @if unitTestRunner.id='jest' **Equal/* @endif */({ route: 'child-router', name: 'child-router', moduleId: '/* @if bundler.id='webpack' **.//* @endif */child-router', nav: true, title:'Child Router' });
  });
});
