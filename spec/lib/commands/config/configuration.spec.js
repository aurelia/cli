describe('The config command - configuration', () => {
  let mockfs;

  const CLIOptions = require('../../../../lib/cli-options').CLIOptions;
  const Configuration = require('../../../../lib/commands/config/configuration');
  let configuration;
  let project;
  let projectControl;
  beforeEach(() => {
    project = {
      'top1': {
        'middle': {
          'bottom1': {
            'rock': 'bottom'
          },
          'bottom2': [
            'also',
            'bottom'
          ]
        }
      },
      'top2': ['one', 2, { 'three': 'four' }],
      'top3': 'string3',
      'top4': 4
    };
    projectControl = JSON.parse(JSON.stringify(project));

    mockfs = require('mock-fs');
    mockfs({
      'aurelia_project': {
        'aurelia.json': JSON.stringify(project)
      }
    });
    CLIOptions.instance = new CLIOptions();
    Object.assign(CLIOptions.instance, { originalBaseDir: '.' });
    configuration = new Configuration(CLIOptions.instance);
  });

  afterEach(() => {
    mockfs.restore();
  });

  it('normalizes keys', () => {
    const values = {
      'one': 'one',
      'one two three': 'one two three',
      'one.two.three': 'one.two.three',
      'one.two three': 'one.two three',
      'one.[two three].four': 'one.two three.four',
      'one[2].three': 'one.[2].three',
      'one.[2].[3][four][5]': 'one.[2].[3].four.[5]',
      'one.2.3[four][5]': 'one.2.3.four.[5]'
    };
    for (let key of Object.keys(values)) {
      expect(configuration.normalizeKey(key)).toEqual(values[key]);
    }
  });

  it('parses keys', () => {
    const values = {
      'one': { index: false, key: true, value: 'one' },
      '[2]': { index: true, key: false, value: 2 }
    };
    for (let key of Object.keys(values)) {
      expect(configuration.parsedKey(key)).toEqual(values[key]);
    }
  });

  it('gets values', () => {
    const values = {
      'top1': project.top1,
      'top1.middle': project.top1.middle,
      'top2.[1]': project.top2[1],
      'top1.middle.bottom2.[1]': project.top1.middle.bottom2[1],
      'top2.[2].three': project.top2[2].three
    };
    for (let key of Object.keys(values)) {
      expect(configuration.configEntry(key)).toEqual(values[key]);
    }
  });

  it('gets the complete project without arguments', () => {
    let result = configuration.execute('get', '');

    project = JSON.parse(result.slice(result.indexOf('\n')));
    expect(project).toEqual(projectControl);
  });

  it('gets a value', () => {
    let result = configuration.execute('get', 'top1');

    project = JSON.parse(result.slice(result.indexOf('\n')));
    expect(project).toEqual(projectControl.top1);
  });

  it('sets a value', () => {
    configuration.execute('set', 'top1.middle2', 'added');
    projectControl.top1.middle2 = 'added';

    configuration.execute('set', 'top5.new', 'stuff');
    projectControl.top5 = { 'new': 'stuff' };

    configuration.execute('set', 'top2[2].three', 'fifth');
    projectControl.top2[2].three = 'fifth';

    expect(configuration.project).toEqual(projectControl);
  });

  it('clears a value', () => {
    configuration.execute('clear', 'top1.middle');
    delete projectControl.top1.middle;

    configuration.execute('clear', 'top2[2].three');
    delete projectControl.top2[2].three;

    expect(configuration.project).toEqual(projectControl);
  });

  it('adds a value', () => {
    configuration.execute('add', 'top1.middle2', 'added');
    projectControl.top1.middle2 = 'added';

    configuration.execute('add', 'top2[2].five', 'sixth');
    projectControl.top2[2].five = 'sixth';

    configuration.execute('add', 'top2', { seventh: 'eight' });
    projectControl.top2.push({ seventh: 'eight' });

    expect(configuration.project).toEqual(projectControl);
  });

  it('removes a value', () => {
    configuration.execute('remove', 'top1.middle');
    delete projectControl.top1.middle;

    configuration.execute('remove', 'top2[2]');
    projectControl.top2.splice(2, 1);

    expect(configuration.project).toEqual(projectControl);
  });
});
