import { stat, mkdir, readdir, readFile as _readFile, writeFile as _writeFile  } from 'node:fs/promises'
import { existsSync, readdirSync, readFileSync as _readFileSync, writeFileSync as _writeFileSync, statSync, mkdirSync as _mkdirSync } from 'node:fs';
import { dirname as _dirname } from 'node:path';

export { stat, mkdir, existsSync, readdir, readdirSync, statSync };

/** Accessed by unit-tests */
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
