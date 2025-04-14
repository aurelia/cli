import { transformSync } from '@babel/core'
import * as amdPlugin from '@babel/plugin-transform-modules-amd';

// use babel to translate native es module into AMD module
export function es(fileName: string, fileContents: string) {
  return transformSync(fileContents, {
    babelrc: false,
    plugins: [[amdPlugin, {loose: true}]]
  }).code;
};
