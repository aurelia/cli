import { PLATFORM } from 'aurelia-pal';

export { HelloWorld } from './hello-world';

export function configure(config) {
  config.globalResources([
    PLATFORM.moduleName('./hello-world')
  ]);
}
