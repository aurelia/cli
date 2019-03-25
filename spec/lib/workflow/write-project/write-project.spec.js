const prepareProject = require('../../../../lib/workflow/write-project/prepare-project');
const writeProject = require('../../../../lib/workflow/write-project/write-project');
const mockfs = require('mock-fs');
const fs = require('../../../../lib/file-system');
const path = require('path');

describe('The writeProejct func', () => {
  beforeEach(() => {
    mockfs({});
  });

  afterEach(() => {
    mockfs.restore();
  });

  it('overwrites existing file by default', done => {
    mockfs({
      'skeleton/common/file.js': 'new-file',
      'skeleton/common/f/file2.js': 'new-file2',
      'output/file.js': 'file',
      'output/f/file2.js': 'file2'
    });

    prepareProject('aurelia-app', [], 'skeleton')
      .pipe(writeProject('output'))
      .once('error', done)
      .on('finish', () => {
        expect(fs.readdirSync('output').sort()).toEqual(['f', 'file.js']);
        expect(fs.readFileSync(path.join('output', 'file.js'), 'utf8')).toBe('new-file');
        expect(fs.readFileSync(path.join('output', 'f', 'file2.js'), 'utf8')).toBe('new-file2');
        done();
      });
  });

  it('can skip existing file', done => {
    mockfs({
      'skeleton/common/file.js__skip-if-exists': 'new-file',
      'skeleton/common/f/file2.js__skip-if-exists': 'new-file2',
      'output/file.js': 'file',
      'output/f/file2.js': 'file2'
    });

    prepareProject('aurelia-app', [], 'skeleton')
      .pipe(writeProject('output'))
      .once('error', done)
      .on('finish', () => {
        expect(fs.readdirSync('output').sort()).toEqual(['f', 'file.js']);
        expect(fs.readFileSync(path.join('output', 'file.js'), 'utf8')).toBe('file');
        expect(fs.readFileSync(path.join('output', 'f', 'file2.js'), 'utf8')).toBe('file2');
        done();
      });
  });

  it('can append existing file', done => {
    mockfs({
      'skeleton/common/file.js__append-if-exists': 'new-file',
      'skeleton/common/f/file2.js__append-if-exists': 'new-file2',
      'output/file.js': 'file',
      'output/f/file2.js': 'file2'
    });

    prepareProject('aurelia-app', [], 'skeleton')
      .pipe(writeProject('output'))
      .once('error', done)
      .on('finish', () => {
        expect(fs.readdirSync('output').sort()).toEqual(['f', 'file.js']);
        expect(fs.readFileSync(path.join('output', 'file.js'), 'utf8')).toBe('filenew-file');
        expect(fs.readFileSync(path.join('output', 'f', 'file2.js'), 'utf8')).toBe('file2new-file2');
        done();
      });
  });

  it('in unattended mode, ask-if-exists will keep existing file, but generate new file with suffix', done => {
    mockfs({
      'skeleton/common/file.js__ask-if-exists': 'new-file',
      'skeleton/common/f/file2.js__ask-if-exists': 'new-file2',
      'output/file.js': 'file',
      'output/f/file2.js': 'file2'
    });

    prepareProject('aurelia-app', [], 'skeleton')
      .pipe(writeProject('output', {unattended: true}))
      .once('error', done)
      .on('finish', () => {
        expect(fs.readdirSync('output').sort()).toEqual(['f', 'file.js', 'file.js__au-cli']);
        expect(fs.readFileSync(path.join('output', 'file.js'), 'utf8')).toBe('file');
        expect(fs.readFileSync(path.join('output', 'file.js__au-cli'), 'utf8')).toBe('new-file');
        expect(fs.readFileSync(path.join('output', 'f', 'file2.js'), 'utf8')).toBe('file2');
        expect(fs.readFileSync(path.join('output', 'f', 'file2.js__au-cli'), 'utf8')).toBe('new-file2');
        done();
      });
  });

  it('in interactive mode, ask-if-exists will ask user, simulate selection of "keep the existing file"', done => {
    mockfs({
      'skeleton/common/file.js__ask-if-exists': 'new-file',
      'skeleton/common/f/file2.js__ask-if-exists': 'new-file2',
      'output/file.js': 'file',
      'output/f/file2.js': 'file2'
    });

    prepareProject('aurelia-app', [], 'skeleton')
      .pipe(writeProject('output', {_question: () => Promise.resolve(false)}))
      .once('error', done)
      .on('finish', () => {
        expect(fs.readdirSync('output').sort()).toEqual(['f', 'file.js', 'file.js__au-cli']);
        expect(fs.readFileSync(path.join('output', 'file.js'), 'utf8')).toBe('file');
        expect(fs.readFileSync(path.join('output', 'file.js__au-cli'), 'utf8')).toBe('new-file');
        expect(fs.readFileSync(path.join('output', 'f', 'file2.js'), 'utf8')).toBe('file2');
        expect(fs.readFileSync(path.join('output', 'f', 'file2.js__au-cli'), 'utf8')).toBe('new-file2');
        done();
      });
  });

  it('in interactive mode, ask-if-exists will ask user, simulate selection of "replace the existing file"', done => {
    mockfs({
      'skeleton/common/file.js__ask-if-exists': 'new-file',
      'skeleton/common/f/file2.js__ask-if-exists': 'new-file2',
      'output/file.js': 'file',
      'output/f/file2.js': 'file2'
    });

    prepareProject('aurelia-app', [], 'skeleton')
      .pipe(writeProject('output', {_question: () => Promise.resolve(true)}))
      .once('error', done)
      .on('finish', () => {
        expect(fs.readdirSync('output').sort()).toEqual(['f', 'file.js']);
        expect(fs.readFileSync(path.join('output', 'file.js'), 'utf8')).toBe('new-file');
        expect(fs.readdirSync(path.join('output', 'f')).sort()).toEqual(['file2.js']);
        expect(fs.readFileSync(path.join('output', 'f', 'file2.js'), 'utf8')).toBe('new-file2');
        done();
      });
  });

  it('appends readme by default, but can overwrite the behaviour', done => {
    mockfs({
      'skeleton/common/a-readme': 'new-a\n',
      'skeleton/common/b-readme.md__skip-if-exists': 'new-b\n',
      'output/a-readme': 'old-a\n',
      'output/b-readme.md': 'old-b\n'
    });

    prepareProject('aurelia-app', [], 'skeleton')
      .pipe(writeProject('output'))
      .once('error', done)
      .on('finish', () => {
        expect(fs.readdirSync('output').sort()).toEqual(['a-readme', 'b-readme.md']);
        expect(fs.readFileSync(path.join('output', 'a-readme'), 'utf8')).toBe('old-a\nnew-a\n');
        expect(fs.readFileSync(path.join('output', 'b-readme.md'), 'utf8')).toBe('old-b\n');
        done();
      });
  });

  it('merges deps for package.json', done => {
    mockfs({
      'skeleton/common/package.json': `
        {
          "name": "aurelia-app",
          "dependencies": {
            "aurelia-bootstrapper": "^1.0.0"
          },
          "devDependencies": {
            "aurelia-cli": "^1.0.0",
            "gulp": "^4.0.0"
          },
          "peerDependencies": {
            "foo": "^1.0.0"
          }
        }
      `,
      'output/package.json': `
        {
          "name": "awesome-app",
          "dependencies": {
            "awesome": "^1.0.0"
          },
          "devDependencies": {
            "tool": "^2.0.0"
          }
        }
      `
    });

    prepareProject('aurelia-app', [], 'skeleton')
      .pipe(writeProject('output'))
      .once('error', done)
      .on('finish', () => {
        expect(fs.readdirSync('output').sort()).toEqual(['package.json']);
        const writtenJson = fs.readFileSync(path.join('output', 'package.json'), 'utf8');
        expect(JSON.parse(writtenJson)).toEqual({
          name: 'awesome-app',
          dependencies: {
            awesome: '^1.0.0',
            'aurelia-bootstrapper': '^1.0.0'
          },
          devDependencies: {
            tool: '^2.0.0',
            'aurelia-cli': '^1.0.0',
            gulp: '^4.0.0'
          },
          peerDependencies: {
            foo: '^1.0.0'
          }
        });
        done();
      });
  });

  it('skips project.csproj if project.csproj file exists', done => {
    mockfs({
      'skeleton/common/project.csproj': 'new csproj',
      'output/project.csproj': 'csproj'
    });

    prepareProject('aurelia-app', [], 'skeleton')
      .pipe(writeProject('output'))
      .once('error', done)
      .on('finish', () => {
        expect(fs.readdirSync('output').sort()).toEqual(['project.csproj']);
        expect(fs.readFileSync(path.join('output', 'project.csproj'), 'utf8')).toBe('csproj');
        done();
      });
  });

  it('skips project.csproj if any .csproj file exists', done => {
    mockfs({
      'skeleton/common/project.csproj': 'new csproj',
      'output/some.csproj': 'csproj'
    });

    prepareProject('aurelia-app', [], 'skeleton')
      .pipe(writeProject('output'))
      .once('error', done)
      .on('finish', () => {
        expect(fs.readdirSync('output').sort()).toEqual(['some.csproj']);
        expect(fs.readFileSync(path.join('output', 'some.csproj'), 'utf8')).toBe('csproj');
        done();
      });
  });

  it('writes project.csproj if no .csproj file exists', done => {
    mockfs({
      'skeleton/common/project.csproj': 'new csproj'
    });

    prepareProject('aurelia-app', [], 'skeleton')
      .pipe(writeProject('output'))
      .once('error', done)
      .on('finish', () => {
        expect(fs.readdirSync('output').sort()).toEqual(['project.csproj']);
        expect(fs.readFileSync(path.join('output', 'project.csproj'), 'utf8')).toBe('new csproj');
        done();
      });
  });

  it('does not write instructions if file is not skipped', done => {
    mockfs({
      'skeleton/common/file.js__instructions': 'do something',
      'skeleton/common/file.js__skip-if-exists': 'new file'
    });

    prepareProject('aurelia-app', [], 'skeleton')
      .pipe(writeProject('output'))
      .once('error', done)
      .on('finish', () => {
        expect(fs.readdirSync('output').sort()).toEqual(['file.js']);
        expect(fs.readFileSync(path.join('output', 'file.js'), 'utf8')).toBe('new file');
        done();
      });
  });

  it('writes instructions if file is skipped', done => {
    mockfs({
      'skeleton/common/file.js__instructions': 'do something',
      'skeleton/common/file.js__skip-if-exists': 'new file',
      'output/file.js': 'old file'
    });

    prepareProject('aurelia-app', [], 'skeleton')
      .pipe(writeProject('output'))
      .once('error', done)
      .on('finish', () => {
        expect(fs.readdirSync('output').sort()).toEqual(['file.js', 'instructions.txt']);
        expect(fs.readFileSync(path.join('output', 'file.js'), 'utf8')).toBe('old file');
        expect(fs.readFileSync(path.join('output', 'instructions.txt'), 'utf8')).toBe('do something');
        done();
      });
  });

  it('merges instructions if multiple files are skipped', done => {
    mockfs({
      'skeleton/common/file.js__instructions': 'do something',
      'skeleton/common/file.js__skip-if-exists': 'new file',
      'skeleton/common/file2.js__instructions': 'do something2',
      'skeleton/common/file2.js__skip-if-exists': 'new file2',
      'output/file.js': 'old file',
      'output/file2.js': 'old file2'
    });

    prepareProject('aurelia-app', [], 'skeleton')
      .pipe(writeProject('output'))
      .once('error', done)
      .on('finish', () => {
        expect(fs.readdirSync('output').sort()).toEqual(['file.js', 'file2.js', 'instructions.txt']);
        expect(fs.readFileSync(path.join('output', 'file.js'), 'utf8')).toBe('old file');
        expect(fs.readFileSync(path.join('output', 'file2.js'), 'utf8')).toBe('old file2');
        expect(fs.readFileSync(path.join('output', 'instructions.txt'), 'utf8')).toBe('do something\ndo something2');
        done();
      });
  });
});
