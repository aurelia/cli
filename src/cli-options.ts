import * as fs from './file-system';

function definedEnvironments() {
  const envs: string[] = [];
  // read user defined environment files
  let files: string[];
  try {
    files = fs.readdirSync('aurelia_project/environments');
  } catch {
    // ignore
  }
  if (Array.isArray(files)) {
    files.forEach(file => {
      const m = file.match(/^(.+)\.(t|j)s$/);
      if (m) envs.push(m[1]);
    });
  }
  return envs;
}

export class CLIOptions {
  public taskPath: string | undefined;
  public args: string[] | undefined;
  public commandName: string | undefined;
  /** accessed from `/bin/aurelia-cli.js` */
  public runningGlobally: boolean | undefined;
  /** accessed from `/bin/aurelia-cli.js` */
  public runningLocally: boolean | undefined;
  public originalBaseDir: string | undefined;
  /** accessed from unit tests */
  public static instance: CLIOptions;
  /** accessed from unit tests */
  public env: string | undefined;

  constructor() {
    CLIOptions.instance = this;
  }

  taskName() {
    const name = this.taskPath.split(/[/\\]/).pop();
    const parts = name.split('.');
    parts.pop();
    return parts.join('.');
  }

  getEnvironment() {
    if (this.env) return this.env;

    let env = this.getFlagValue('env') || process.env.NODE_ENV || 'dev';
    const envs = definedEnvironments();

    if (!envs.includes(env)) {
      // normalize NODE_ENV production/development (Node.js convention) to prod/dev
      // only if user didn't define production.js or development.js
      if (env === 'production' && envs.includes('prod')) {
        env = 'prod';
      } else if (env === 'development' && envs.includes('dev')) {
        env = 'dev';
      } else if (env !== 'dev') {
        // forgive missing aurelia_project/environments/dev.js as dev is our default env
        console.error(`The selected environment "${env}" is not defined in your aurelia_project/environments folder.`);
        process.exit(1);
        return;
      }
    }

    this.env = env;
    return env;
  }

  hasFlag(name: string, shortcut?:string) {
    if (this.args) {
      let lookup = '--' + name;
      let found = this.args.indexOf(lookup) !== -1;

      if (found) {
        return true;
      }

      lookup = shortcut || ('-' + name[0]);
      found = this.args.indexOf(lookup) !== -1;

      if (found) {
        return true;
      }

      lookup = '-' + name;
      return this.args.indexOf(lookup) !== -1;
    }

    return false;
  }

  getFlagValue(name:string, shortcut?:string) {
    if (this.args) {
      let lookup = '--' + name;
      let index = this.args.indexOf(lookup);

      if (index !== -1) {
        return this.args[index + 1] || null;
      }

      lookup = shortcut || ('-' + name[0]);
      index = this.args.indexOf(lookup);

      if (index !== -1) {
        return this.args[index + 1] || null;
      }

      lookup = '-' + name;
      index = this.args.indexOf(lookup);

      if (index !== -1) {
        return this.args[index + 1] || null;
      }

      return null;
    }

    return null;
  }

  static taskName() {
    return CLIOptions.instance.taskName();
  }

  static hasFlag(name: string, shortcut?: string) {
    return CLIOptions.instance.hasFlag(name, shortcut);
  }

  static getFlagValue(name: string, shortcut?: string) {
    return CLIOptions.instance.getFlagValue(name, shortcut);
  }

  static getEnvironment() {
    return CLIOptions.instance.getEnvironment();
  }
};
