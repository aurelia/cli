import { PLATFORM } from 'aurelia-pal';
import { StageComponent } from 'aurelia-testing';
import { bootstrap } from 'aurelia-bootstrapper';

describe('The HelloWorld component', () => {

  let component;

  beforeEach(done => {
    component = StageComponent
      .withResources(PLATFORM.moduleName('hello-world'))
      .inView('<hello-world></hello-world>')
      .boundTo({ });
    component.create(bootstrap).then(done);
  });

  afterEach(() => {
    component.dispose();
  });

  it('should render the text', () => {
    const text = (component.element.textContent || '').trim();
    expect(text).toEqual('Hello, world!!');
  });
});
