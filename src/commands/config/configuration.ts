import * as os from 'node:os';
import { copySync, readFileSync, writeFile } from '../../file-system';
import { CLIOptions } from '../../cli-options';

export class Configuration {
  private options: CLIOptions;
  private aureliaJsonPath: string;
  private project: AureliaJson.IProject;

  constructor(options: CLIOptions) {
    this.options = options;
    this.aureliaJsonPath = options.originalBaseDir + '/aurelia_project/aurelia.json';
    this.project = JSON.parse(readFileSync(this.aureliaJsonPath)) as AureliaJson.IProject;
  }

  configEntry(key: string, createKey?: string): object | null | undefined {
    let entry: object | null | undefined = this.project;
    const keys = key.split('.');

    if (!keys[0]) {
      return entry;
    }

    while (entry && keys.length) {
      const parsedKey = this.parsedKey(keys.shift());
      if (entry[parsedKey.value] === undefined || entry[parsedKey.value] === null) {
        if (!createKey) {
          return entry[parsedKey.value];
        }
        const checkKey = this.parsedKey(keys.length ? keys[0] : createKey);
        if (checkKey.index) {
          entry[parsedKey.value] = [];
        } else if (checkKey.key) {
          entry[parsedKey.value] = {};
        }
      }
      entry = entry[parsedKey.value];

      // TODO: Add support for finding objects based on input values?
      // TODO: Add support for finding string in array?
    }

    return entry;
  }

  parsedKey(key: string) {
    if (/\[(\d+)\]/.test(key)) {
      return { index: true as const, key: false as const, value: +(RegExp.$1) };
    }

    return { index: false as const, key: true as const, value: key };
  }

  normalizeKey(key: string) {
    const re = /([^.])\[/;
    while (re.exec(key)) {
      key = key.replace(re, RegExp.$1 + '.[');
    }

    const keys = key.split('.');
    for (let i = 0; i < keys.length; i++) {
      if (/\[(\d+)\]/.test(keys[i])) {
        // console.log(`keys[${i}] is index: ${keys[i]}`);
      } else if (/\[(.+)\]/.test(keys[i])) {
        // console.log(`keys[${i}] is indexed name: ${keys[i]}`);
        keys[i] = RegExp.$1;
      } else {
        // console.log(`keys[${i}] is name: ${keys[i]}`);
      }
    }

    return keys.join('.');
  }

  execute(action: string, key:string, value: unknown) {
    const originalKey = key;

    key = this.normalizeKey(key);

    if (action === 'get') {
      return `Configuration key '${key}' is:` + os.EOL + JSON.stringify(this.configEntry(key), null, 2);
    }

    const keys = key.split('.');
    const parsedKey = this.parsedKey(keys.pop());
    const parent = keys.join('.');

    if (action === 'set') {
      const entry = this.configEntry(parent, parsedKey.value.toString());
      if (entry) {
        entry[parsedKey.value] = value;
      } else {
        console.log('Failed to set property', this.normalizeKey(originalKey), '!');
      }
    } else if (action === 'clear') {
      const entry = this.configEntry(parent);
      if (entry && (parsedKey.value in entry)) {
        delete entry[parsedKey.value];
      } else {
        console.log('No property', this.normalizeKey(originalKey), 'to clear!');
      }
    } else if (action === 'add') {
      const entry = this.configEntry(parent, parsedKey.value.toString());
      if (Array.isArray(entry[parsedKey.value]) && !Array.isArray(value)) {
        value = [value];
      } if (Array.isArray(value) && !Array.isArray(entry[parsedKey.value])) {
        entry[parsedKey.value] = (entry ? [entry[parsedKey.value]] : []);
      } if (Array.isArray(value)) {
        entry[parsedKey.value].push(...value);
      } else if (Object(value) === value) {
        if (Object(entry[parsedKey.value]) !== entry[parsedKey.value]) {
          entry[parsedKey.value] = {};
        }
        Object.assign(entry[parsedKey.value], value);
      } else {
        entry[parsedKey.value] = value;
      }
    } else if (action === 'remove') {
      const entry = this.configEntry(parent);

      if (Array.isArray(entry) && parsedKey.index) {
        entry.splice(parsedKey.value, 1);
      } else if (Object(entry) === entry && parsedKey.key) {
        delete entry[parsedKey.value];
      } else if (!entry) {
        console.log('No property', this.normalizeKey(originalKey), 'to remove from!');
      } else {
        console.log('Can\'t remove value from', entry[parsedKey.value], '!');
      }
    }
    key = this.normalizeKey(originalKey);
    return `Configuration key '${key}' is now:` + os.EOL + JSON.stringify(this.configEntry(key), null, 2);
  }

  save(backup: unknown) {
    if (backup === undefined) backup = true;

    const unique = new Date().toISOString().replace(/[T\D]/g, '');
    const arr = this.aureliaJsonPath.split(/[\\/]/);
    const name = arr.pop();
    const path = arr.join('/');
    const bak = `${name}.${unique}.bak`;

    if (backup) {
      copySync(this.aureliaJsonPath, [path, bak].join('/'));
    }

    return writeFile(this.aureliaJsonPath, JSON.stringify(this.project, null, 2), 'utf8')
      .then(() => { return bak; });
  }
}
