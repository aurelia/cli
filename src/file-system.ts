import { access, constants, stat, mkdir, readdir, appendFile, readFile as _readFile, writeFile as _writeFile  } from 'node:fs/promises'
import { existsSync, readdirSync, readFileSync as _readFileSync, writeFileSync as _writeFileSync, statSync, mkdirSync as _mkdirSync } from 'node:fs';
import { join as _join, resolve as _resolve, dirname as _dirname } from 'node:path';

export { stat, mkdir, existsSync, readdir, appendFile, readdirSync, statSync };

export async function exists(path: string) {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
};

export function mkdirp(path: string) {
  return mkdir(path, {recursive: true});
};

export function readFile(path: string, encoding: BufferEncoding = 'utf8') {
  return _readFile(path, encoding);
}

export function readFileSync(path: string, encoding: BufferEncoding = 'utf8') {
  return _readFileSync(path, encoding);
};

export function copySync(sourceFile: string, targetFile: string) {
  _writeFileSync(targetFile, _readFileSync(sourceFile));
};

export function resolve(path: string) {
  return _resolve(path);
};

export function join() {
  return _join.apply(this, Array.prototype.slice.call(arguments));
};

export function isFile(path: string) {
  try {
    return statSync(path).isFile();
  } catch {
    // ignore
    return false;
  }
};

export function isDirectory(path: string) {
  try {
    return statSync(path).isDirectory();
  } catch {
    // ignore
    return false;
  }
};

export async function writeFile(path: string, content: string | Buffer, encoding: BufferEncoding = 'utf8') {
  await mkdir(_dirname(path), { recursive: true });
  await _writeFile(path, content, encoding);
};

export function writeFileSync(path: string, content: string | Buffer, encoding: BufferEncoding = 'utf8') {
  _mkdirSync(_dirname(path), { recursive: true });
  _writeFileSync(path, content, encoding);
};
