const { mkdtempSync, rmSync, mkdirSync, writeFileSync } = require('fs');
const { join, dirname } = require('path');
const tmpdir = mkdtempSync(join(__dirname, '..', '..', 'tmpdir-'));
// By default work in a child folder. Some tests run against parent folder
const defaultdir = join(tmpdir, 'a');

function fillFiles(fileTree, baseDir = defaultdir) {
  mkdirSync(baseDir, { recursive: true });
  for (const key in fileTree) {
    const val = fileTree[key];
    const p = join(baseDir, key);
    if (typeof val === 'string') {
      mkdirSync(dirname(p), { recursive: true });
      writeFileSync(p, val);
    } else if (typeof val === 'object') {
      fillFiles(val, p);
    }
  }
}

let oldCwd;

// Simple implementation of mockfs in local tmp dir.
function mockfs(fileTree) {
  fillFiles(fileTree);
  if (!oldCwd) {
    oldCwd = process.cwd();
    process.chdir(defaultdir);
  }
}

mockfs.restore = function() {
  if (oldCwd) {
    process.chdir(oldCwd);
    oldCwd = undefined;
  }
  rmSync(tmpdir, { force: true, recursive: true });
}

process.on('exit', mockfs.restore);

module.exports = mockfs;
