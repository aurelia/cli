"use strict";

const ERROR_CODES = {
  ENOENT: 'ENOENT',
  EEXIST: 'EEXIST'
};

describe('The file-system module', () => {
  let mockfs;
  let path;
  let mkdirp;
  let fs;

  let readDir;
  let readFile;
  let writeDir;
  let writeFile;
  
  beforeEach(() => {
    mockfs = require('mock-fs');
    path = require('path');
    mkdirp = require('../../lib/mkdirp');
    fs = require('../../lib/file-system');

    readDir = 'read';
    readFile = {
      name: 'read.js',
      content: 'content'
    };
    readFile.path = path.join(readDir, readFile.name);

    writeDir = 'write';
    writeFile = {
      name: 'write.js',
      content: 'content'
    };
    writeFile.path = path.join(writeDir, writeFile.name);

    const config = {};
    config[readFile.path] = readFile.content;

    mockfs(config);
  });
  
  afterEach(() => {
    mockfs.restore();
  });

  describe('The stat() function', () => {
    it('reads the stats for a directory', done => {
      fs.stat(readDir).then(stats => {
        expect(stats).toBeDefined();
      }).catch(fail).then(done);
    });

    it('reads the stats for a file', done => {
      fs.stat(readFile.path).then(stats => {
        expect(stats).toBeDefined();
      }).catch(fail).then(done);
    });

    it('rejects with an ENOENT error on a non-existing directory', done => {
      fs.stat(writeDir).then(() => {
        fail('expected promise to be rejected');
      }).catch(e => {
        expect(e.code).toBe(ERROR_CODES.ENOENT);
      }).then(done);
    });

    it('rejects with an ENOENT error on a non-existing file', done => {
      fs.stat(writeFile.path).then(() => {
        fail('expected promise to be rejected');
      }).catch(e => {
        expect(e.code).toBe(ERROR_CODES.ENOENT);
      }).then(done);
    })
  });

  describe('The readdir() function', () => {
    it('reads a directory', done => {
      fs.readdir(readDir).then(files => {
        expect(files).toEqual([readFile.name]);
      }).catch(fail).then(done);
    });

    it('rejects with ENOENT', done => {
      fs.readdir(writeDir).then(() => {
        fail('expected promise to be rejected');
      }).catch(e => {
        expect(e.code).toBe(ERROR_CODES.ENOENT);
      }).then(done);
    });
  });

  describe('The mkdir() function', () => {
    it('makes a directory', done => {
      fs.mkdir(writeDir)
        .catch(fail)
        .then(() => fs.readdir(writeDir))
        .catch(fail)
        .then(done);
    });

    it('rejects with EEXIST', done => {
      fs.mkdir(readDir)
        .then(() => fail('expected promise to be rejected'))
        .catch(e => expect(e.code).toBe(ERROR_CODES.EEXIST))
        .then(done);
    });
  });

  describe('The mkdirp() function', () => {
    it('makes deep directories', done => {
      fs.mkdirp(writeDir + readDir).then(() => {
        return fs.readdir(writeDir + readDir);
      }).catch(fail).then(done);
    });

    it('rejects if mkdirp returns an error', done => {
      pending(`change file-system to mkdirp.mkdirp or more helpers.`);
    });
  });

  describe('The readFile() function', () => {
    it('returns a promise resolving to the files content', done => {
      fs.readFile(readFile.path).then(content => {
        expect(content).toBe(readFile.content);
      }).catch(fail).then(done);
    });

    it('rejects with ENOENT error', done => {
      fs.readFile(writeFile.path).then(() => {
        fail('expected promise to be rejected');
      }).catch(e => {
        expect(e.code).toBe(ERROR_CODES.ENOENT);
        done();
      });
    });
  });

  describe('The readFileSync() function', () => {
    it('returns the files content', () => {
      expect(fs.readFileSync(readFile.path))
        .toBe(readFile.content);
    });

    it('throws an ENOENT error', () => {
      try {
        fs.readFileSync(writeFile.path);
        fail(`expected fs.readFileSync('${writeFile.path}') to throw`);
      } catch (e) {
        expect(e.code).toBe(ERROR_CODES.ENOENT);
      }
    });
  });

  describe('The writeFile() function', () => {
    it('creates a new file', done => {
      fs.writeFile(writeFile.path, writeFile.content).then(() => {
        return fs.readFile(writeFile.path)
      }).then(content => {
        expect(content).toBe(writeFile.content);
        done();
      });
    });
  });
});
