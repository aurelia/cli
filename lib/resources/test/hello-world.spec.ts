import { PLATFORM } from 'aurelia-framework';
import { StageComponent, ComponentTester } from 'aurelia-testing';
import { bootstrap } from 'aurelia-bootstrapper';

describe('The HelloWorld component', () => {

  let component: ComponentTester;

  beforeEach(async done => {
    component = StageComponent
      .withResources(PLATFORM.moduleName('hello-world'))
      .inView('<hello-world></hello-world>')
      .boundTo({ });
    await component.create(bootstrap);
    done();
  });

  afterEach(() => {
    component.dispose();
  });

  it('should render the text', () => {
    const text = (component.element.textContent || '').trim();
    expect(text).toEqual('Hello, world!');
  });
});
