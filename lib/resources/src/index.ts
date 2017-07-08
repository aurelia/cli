import { FrameworkConfiguration, PLATFORM } from 'aurelia-framework';

export { HelloWorld } from './hello-world';

export function configure(config: FrameworkConfiguration) {
  config.globalResources([
    PLATFORM.moduleName('./hello-world')
  ]);
}
