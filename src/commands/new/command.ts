import {spawn} from 'node:child_process';

export default class {
  async execute(args: string[]) {
    // Calls "npx makes aurelia/v1"
    // https://github.com/aurelia/v1
    spawn('npx', ['makes', 'aurelia/v1', ...args], {stdio: 'inherit', shell: true});
  }
};

