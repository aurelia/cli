const os = require('os');
const copySync = require('../../file-system').copySync;
const readFileSync = require('../../file-system').readFileSync;
const writeFile = require('../../file-system').writeFile;

class Configuration {
  constructor(options) {
    this.options = options;
    this.aureliaJsonPath = options.originalBaseDir + '/aurelia_project/aurelia.json';
    this.project = JSON.parse(readFileSync(this.aureliaJsonPath));
  }

  configEntry(key, createKey) {
    let entry = this.project;
    let keys = key.split('.');

    if (!keys[0]) {
      return entry;
    }

    while (entry && keys.length) {
      key = this.parsedKey(keys.shift());
      if (entry[key.value] === undefined || entry[key.value] === null) {
        if (!createKey) {
          return entry[key.value];
        }
        let checkKey = this.parsedKey(keys.length ? keys[0] : createKey);
        if (checkKey.index) {
          entry[key.value] = [];
        } else if (checkKey.key) {
          entry[key.value] = {};
        }
      }
      entry = entry[key.value];

      // TODO: Add support for finding objects based on input values?
      // TODO: Add support for finding string in array?
    }

    return entry;
  }

  parsedKey(key) {
    if (/\[(\d+)\]/.test(key)) {
      return { index: true, key: false, value: +(RegExp.$1) };
    }

    return { index: false, key: true, value: key };
  }

  normalizeKey(key) {
    const re = /([^.])\[/;
    while (re.exec(key)) {
      key = key.replace(re, RegExp.$1 + '.[');
    }

    let keys = key.split('.');
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

  execute(action, key, value) {
    let originalKey = key;

    key = this.normalizeKey(key);

    if (action === 'get') {
      return `Configuration key '${key}' is:` + os.EOL + JSON.stringify(this.configEntry(key), null, 2);
    }

    let keys = key.split('.');
    key = this.parsedKey(keys.pop());
    let parent = keys.join('.');

    if (action === 'set') {
      let entry = this.configEntry(parent, key.value);
      if (entry) {
        entry[key.value] = value;
      } else {
        console.log('Failed to set property', this.normalizeKey(originalKey), '!');
      }
    } else if (action === 'clear') {
      let entry = this.configEntry(parent);
      if (entry && (key.value in entry)) {
        delete entry[key.value];
      } else {
        console.log('No property', this.normalizeKey(originalKey), 'to clear!');
      }
    } else if (action === 'add') {
      let entry = this.configEntry(parent, key.value);
      if (Array.isArray(entry[key.value]) && !Array.isArray(value)) {
        value = [value];
      } if (Array.isArray(value) && !Array.isArray(entry[key.value])) {
        entry[key.value] = (entry ? [entry[key.value]] : []);
      } if (Array.isArray(value)) {
        entry[key.value].push.apply(entry[key.value], value);
      } else if (Object(value) === value) {
        if (Object(entry[key.value]) !== entry[key.value]) {
          entry[key.value] = {};
        }
        Object.assign(entry[key.value], value);
      } else {
        entry[key.value] = value;
      }
    } else if (action === 'remove') {
      let entry = this.configEntry(parent);

      if (Array.isArray(entry) && key.index) {
        entry.splice(key.value, 1);
      } else if (Object(entry) === entry && key.key) {
        delete entry[key.value];
      } else if (!entry) {
        console.log('No property', this.normalizeKey(originalKey), 'to remove from!');
      } else {
        console.log("Can't remove value from", entry[key.value], '!');
      }
    }
    key = this.normalizeKey(originalKey);
    return `Configuration key '${key}' is now:` + os.EOL + JSON.stringify(this.configEntry(key), null, 2);
  }

  save(backup) {
    if (backup === undefined) backup = true;

    const unique = new Date().toISOString().replace(/[T\D]/g, '');
    let arr = this.aureliaJsonPath.split(/[\\\/]/);
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

module.exports = Configuration;
