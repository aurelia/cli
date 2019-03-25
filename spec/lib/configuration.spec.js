const Configuration = require('../../lib/configuration').Configuration;
const CLIOptionsMock = require('../mocks/cli-options');

describe('the Configuration module', () => {
  let cliOptionsMock;

  beforeEach(() => {
    cliOptionsMock = new CLIOptionsMock();
    cliOptionsMock.attach();
  });

  afterEach(() => {
    cliOptionsMock.detach();
  });

  it('overrides default options with customized options', () => {
    let config = new Configuration({ fromString: true }, { fromString: false });
    expect(config.getAllOptions().fromString).toBe(true);
  });

  describe('the getAllOptions() function', () => {
    it('returns the entire options object', () => {
      let options = {
        rev: 'dev & prod',
        minify: true,
        inject: { dev: { value: true } }
      };
      let config = new Configuration({}, options);
      expect(config.getAllOptions()).toEqual(options);
    });
  });

  describe('the getValue() function', () => {
    it('supports multi level options', () => {
      let options = new Configuration({}, {
        foo: {
          bar: {
            dev: {
              value: 'someValue'
            },
            staging: {
              value: 'someOtherValue'
            }
          }
        }
      }, 'dev');
      expect(options.getValue('foo.bar').value).toBe('someValue');

      options = new Configuration({}, {
        foo: {
          bar: {
            'dev & prod': {
              value: 'someValue'
            }
          }
        }
      }, 'dev');
      expect(options.getValue('foo.bar').value).toBe('someValue');

      options = new Configuration({}, {
        foo: {
          bar: {
            dev: {
              value: {
                options: true
              }
            }
          }
        }
      }, 'dev');
      expect(options.getValue('foo.bar').value.options).toBe(true);

      options = new Configuration({}, {
        foo: {
          bar: 'abcd'
        }
      }, 'dev');
      expect(options.getValue('foo.bar')).toBe('abcd');
    });

    it('supports one level options', () => {
      let options = new Configuration({}, { foo: 'someValue' }, 'dev');
      expect(options.getValue('foo')).toBe('someValue');
    });

    it('returns undefined when property is not defined', () => {
      let options = new Configuration({}, { foo: 'someValue' }, 'dev');
      expect(options.getValue('foobarbaz')).toBe(undefined);

      options = new Configuration({}, { foo: 'someValue' }, 'dev');
      expect(options.getValue('foo.bar.baz')).toBe(undefined);

      options = new Configuration({}, { }, 'dev');
      expect(options.getValue('foo.bar.baz')).toBe(undefined);
    });

    it('applies default config, then environment config', () => {
      let options = new Configuration({}, {
        foo: {
          bar: {
            default: {
              cutoff: 15,
              maxLength: 5000
            },
            dev: {
              maxLength: 3000
            }
          }
        }
      }, 'dev');

      expect(options.getValue('foo.bar')).toEqual({
        cutoff: 15,
        maxLength: 3000
      });

      options = new Configuration({}, {
        foo: {
          bar: {
            dev: {
              maxLength: 3000
            }
          }
        }
      }, 'dev');

      expect(options.getValue('foo.bar')).toEqual({
        maxLength: 3000
      });

      options = new Configuration({}, {
        foo: {
          bar: {
            dev: {
              maxLength: 3000
            },
            'dev & staging': {
              cutoff: 15
            }
          }
        }
      }, 'dev');

      expect(options.getValue('foo.bar')).toEqual({
        maxLength: 3000,
        cutoff: 15
      });
    });
  });

  describe('isApplicable', () => {
    it('supports multi level options', () => {
      let options = new Configuration({}, {
        foo: {
          bar: {
            baz: 'dev & prod'
          }
        }
      }, 'dev');
      expect(options.isApplicable('foo.bar.baz')).toBe(true);

      options = new Configuration({}, {
        foo: {
          bar: true
        }
      }, 'staging');
      expect(options.isApplicable('foo.bar')).toBe(true);

      options = new Configuration({}, {
        foo: {
          bar: {
            dev: false,
            staging: true
          }
        }
      }, 'staging');
      expect(options.isApplicable('foo.bar')).toBe(true);

      options = new Configuration({}, {
        foo: {
          bar: {
            dev: false,
            'staging & prod': true
          }
        }
      }, 'staging');
      expect(options.isApplicable('foo.bar')).toBe(true);

      options = new Configuration({}, {
        foo: {
          bar: false
        }
      }, 'staging');
      expect(options.isApplicable('foo.bar')).toBe(false);
    });

    it('returns false if env not found', () => {
      let options = new Configuration({}, {
        foo: {
          bar: {
            staging: {
              somevalue: 123
            }
          }
        }
      }, 'dev');
      expect(options.isApplicable('foo.bar')).toBe(false);
    });

    it('supports first level options', () => {
      let options = new Configuration({}, {
        foo: 'dev & prod'
      }, 'dev');
      expect(options.isApplicable('foo')).toBe(true);

      options = new Configuration({}, {
        foo: 'dev & prod'
      }, 'staging');
      expect(options.isApplicable('foo')).toBe(false);
    });

    it('interprets strings', () => {
      let options = new Configuration({}, { foo: 'dev & prod' }, 'dev');
      expect(options.isApplicable('foo')).toBe(true);

      options = new Configuration({}, {
        foo: {
          bar: {
            baz: 'dev & prod'
          }
        }
      }, 'dev');
      expect(options.isApplicable('foo.bar.baz')).toBe(true);

      options = new Configuration({}, { foo: 'dev & prod' }, 'staging');
      expect(options.isApplicable('foo')).toBe(false);

      options = new Configuration({}, {
        foo: {
          bar: {
            baz: 'dev & prod'
          }
        }
      }, 'staging');
      expect(options.isApplicable('foo.bar.baz')).toBe(false);

      options = new Configuration({}, {
        foo: {
          bar: {
            'dev & prod': {
              value: true
            }
          }
        }
      }, 'dev');
      expect(options.isApplicable('foo.bar')).toBe(true);

      options = new Configuration({}, {
        foo: {
          bar: {
            'dev & prod': true
          }
        }
      }, 'staging');
      expect(options.isApplicable('foo.bar')).toBe(false);

      options = new Configuration({}, {
        foo: {
          bar: {
            'dev & prod': true
          }
        }
      }, 'dev');
      expect(options.isApplicable('foo.bar')).toBe(true);
    });

    it('supports booleans', () => {
      let options = new Configuration({}, { foo: true }, 'dev');
      expect(options.isApplicable('foo')).toBe(true);

      options = new Configuration({}, { foo: false }, 'dev');
      expect(options.isApplicable('foo')).toBe(false);
    });

    it('supports environments inside an object', () => {
      let options = new Configuration({}, { foo: { dev: true, staging: false } }, 'dev');
      expect(options.isApplicable('foo')).toBe(true);

      options = new Configuration({}, { foo: { dev: false, staging: true } }, 'dev');
      expect(options.isApplicable('foo')).toBe(false);
    });
  });
});
