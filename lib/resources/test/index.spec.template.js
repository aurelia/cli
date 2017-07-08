import { FrameworkConfiguration } from 'aurelia-framework';
import { configure } from '../../src//* @echo name */';

describe('the configure function', () => {

  let configuration;

  beforeEach(() => {
    configuration = jasmine.createSpyObj('configuration', ['globalResources']);
  });

  it('should register a global resource', () => {
    configure(configuration);
    expect(configuration.globalResources).toHaveBeenCalledWith(['./hello-world']);
  });
});
