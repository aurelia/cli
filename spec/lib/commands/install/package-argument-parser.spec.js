'use strict';
const PackageArgumentParser = require('../../../../lib/commands/install/package-argument-parser');

describe('The PackageArgumentParser', () => {
  let sut;

  beforeEach(() => {
    sut = new PackageArgumentParser();
  });

  it('supports git urls', () => {
    const result = sut.parse(['git://github.com/aurelia/i18n.git#auto-install']);
    expect(result[0].argument).toBe('git://github.com/aurelia/i18n.git#auto-install');
    expect(result[0].name).toBe('aurelia-i18n');
  });

  it('supports versioned packages', () => {
    const result = sut.parse(['aurelia-i18n@2.0.0']);
    expect(result[0].argument).toBe('aurelia-i18n@2.0.0');
    expect(result[0].name).toBe('aurelia-i18n');
  });

  it('supports versioned packages', () => {
    const result = sut.parse(['aurelia-i18n@2.0.0']);
    expect(result[0].argument).toBe('aurelia-i18n@2.0.0');
    expect(result[0].name).toBe('aurelia-i18n');
  });

  it('supports scoped packages', () => {
    const result = sut.parse(['@aspnet/signalr-client']);
    expect(result[0].argument).toBe('@aspnet/signalr-client');
    expect(result[0].name).toBe('@aspnet/signalr-client');
  });
});
