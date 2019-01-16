import 'aurelia-polyfills';
import {Options} from 'aurelia-loader-nodejs';
import {initialize} from 'aurelia-pal-browser';
import * as path from 'path';
Options.relativeToDir = path.join(__dirname, 'unit');
initialize();
