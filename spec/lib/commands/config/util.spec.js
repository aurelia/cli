describe('The config command - util', () => {
  let mockfs;
  const CLIOptions = require('../../../../lib/cli-options').CLIOptions;
  const ConfigurationUtilities = require('../../../../lib/commands/config/util');

  beforeEach(() => {
    mockfs = require('mock-fs');
    mockfs({
      'aurelia_project/aurelia.json': '{ "build": {} }'
    });
    CLIOptions.instance = new CLIOptions();
    Object.assign(CLIOptions.instance, { originalBaseDir: '.' });
  });
  afterEach(() => {
    mockfs.restore();
  });

  it('gets the right arg withouth --flag', () => {
    const args = ['zero', 'one', 'two'];
    const configurationUtilities = new ConfigurationUtilities(CLIOptions, args);
    expect(configurationUtilities.getArg(1)).toBe('one');
  });

  it('gets the right arg with --flag', () => {
    const args = ['--zero', 'one', 'two'];
    const configurationUtilities = new ConfigurationUtilities(CLIOptions, args);
    expect(configurationUtilities.getArg(1)).toBe('two');
  });

  it('gets the right action', () => {
    const args = ['--zero', '--remove', '--two', 'three'];
    Object.assign(CLIOptions.instance, { args: args });

    const configurationUtilities = new ConfigurationUtilities(CLIOptions, args);
    expect(configurationUtilities.getAction()).toBe('remove');
  });

  it('gets the right JSON values', () => {
    const args = {};
    const values = {
      '123': '123',
      'one two three': 'one two three',
      '\"456\"': '456',
      '{ \"myKey\": \"myValue\" }': { myKey: 'myValue' },
      '[ \"one\", 2,   \"thre ee\" ]': [ 'one', 2, 'thre ee' ]
    };
    Object.assign(CLIOptions.instance, { args: args });
    const configurationUtilities = new ConfigurationUtilities(CLIOptions, args);

    for (let key of Object.keys(values)) {
      expect(configurationUtilities.getValue(key)).toEqual(values[key]);
    }
  });
});
