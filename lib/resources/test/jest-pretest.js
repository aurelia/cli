import 'aurelia-polyfills';
import { ExtensionHandlers, Options } from 'aurelia-loader-nodejs';
import { globalize } from 'aurelia-pal-nodejs';
import * as path from 'path';
Options.relativeToDir = path.join(__dirname, 'unit');
ExtensionHandlers['.scss'] = (path) => new Promise((resolve) => resolve(path));
globalize();
