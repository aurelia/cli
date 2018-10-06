'use strict';
const stubCoreNodejsModule = require('../../../lib/build/stub-core-nodejs-module');

describe('StubCoreNodejsModule', () => {
  it('stubs some core module with subfix -browserify', () => {
    expect(stubCoreNodejsModule('os', 'src')).toEqual({
      name: 'os',
      path: '../node_modules/os-browserify'
    });
  });

  it('ignores sys', () => {
    expect(stubCoreNodejsModule('sys', 'src')).toBeUndefined();
  });

  it('stubs empty module for some core module', () => {
    expect(stubCoreNodejsModule('fs', 'src')).toBe('define(function(){});');
  });
});
