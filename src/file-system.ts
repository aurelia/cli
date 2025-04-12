import { access, constants } from 'node:fs/promises'
import * as fs from 'node:fs';
import * as nodePath from 'node:path';

export async function exists(path: string) {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
};

export function stat(path: string) {
  return new Promise((resolve, reject) => {
    fs.stat(path, (error, stats) => {
      if (error) reject(error);
      else resolve(stats);
    });
  });
};

export function existsSync(path: string) {
  return fs.existsSync(path);
};

export function mkdir(path: string) {
  return new Promise<void>((resolve, reject) => {
    fs.mkdir(path, error => {
      if (error) reject(error);
      else resolve();
    });
  });
};

export function mkdirp(path: string) {
  return new Promise<void>((resolve, reject) => {
    fs.mkdir(path, {recursive: true}, error => {
      if (error) reject(error);
      else resolve();
    });
  });
};

export function readdir(path: string) {
  return new Promise<string[]>((resolve, reject) => {
    fs.readdir(path, (error, files) => {
      if (error) reject(error);
      else resolve(files);
    });
  });
};

export function appendFile(path: string, text: string, cb: fs.NoParamCallback) {
  fs.appendFile(path, text, cb);
};

export function readdirSync(path: string) {
  return fs.readdirSync(path);
};

export function readFile(path: string, encoding?: BufferEncoding) {
  if (encoding !== null) {
    encoding = encoding || 'utf8';
  }

  return new Promise<string>((resolve, reject) => {
    fs.readFile(path, encoding, (error, data) => {
      if (error) reject(error);
      else resolve(data);
    });
  });
};

export function readFileSync(path: string, encoding?: BufferEncoding) {
  if (encoding !== null) {
    encoding = encoding || 'utf8';
  }

  return fs.readFileSync(path, encoding);
};

export function copySync(sourceFile: string, targetFile: string) {
  fs.writeFileSync(targetFile, fs.readFileSync(sourceFile));
};

export function resolve(path: string) {
  return nodePath.resolve(path);
};

export function join() {
  return nodePath.join.apply(this, Array.prototype.slice.call(arguments));
};

export function statSync(path: string) {
  return fs.statSync(path);
};

export function isFile(path: string) {
  try {
    return fs.statSync(path).isFile();
  } catch {
    // ignore
    return false;
  }
};

export function isDirectory(path: string) {
  try {
    return fs.statSync(path).isDirectory();
  } catch {
    // ignore
    return false;
  }
};

export function writeFile(path: string, content: string | Buffer, encoding?: BufferEncoding) {
  return new Promise<void>((resolve, reject) => {
    fs.mkdir(nodePath.dirname(path), {recursive: true}, err => {
      if (err) reject(err);
      else {
        fs.writeFile(path, content, encoding || 'utf8', error => {
          if (error) reject(error);
          else resolve();
        });
      }
    });
  });
};
