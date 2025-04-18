import { CLIOptions } from './cli-options';

export class Configuration {
  private readonly options: AureliaJson.IBuildOptions;
  private readonly environment: string;

  constructor(options: AureliaJson.IBuildOptions, defaultOptions: AureliaJson.IBuildOptions, environment?: string) {
    this.options = Object.assign({}, defaultOptions, options);
    this.environment = environment || CLIOptions.getEnvironment();
  }

  getAllOptions() {
    return this.options;
  }

  getValue(propPath: string) {
    const split = propPath.split('.');
    // `cur` initially contains options, but then drills into child objects.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let cur: any = this.options;

    for (let i = 0; i < split.length; i++) {
      if (!cur) {
        return undefined;
      }

      cur = cur[split[i]];
    }

    if (typeof cur === 'object') {
      const keys = Object.keys(cur);
      let result = undefined;

      if (keys.indexOf('default') > -1 && typeof(cur.default) === 'object') {
        result = cur.default;
      }

      for (let i = 0; i < keys.length; i++) {
        if (this.matchesEnvironment(this.environment, keys[i])) {
          if (typeof(cur[keys[i]]) === 'object') {
            result = Object.assign(result || {}, cur[keys[i]]);
          } else {
            return cur[keys[i]];
          }
        }
      }

      return result;
    }

    return cur;
  }

  isApplicable(propPath: string) {
    const value = this.getValue(propPath);

    if (!value) {
      return false;
    }

    if (typeof value === 'boolean') {
      return value;
    }

    if (typeof value === 'string') {
      return this.matchesEnvironment(this.environment, value);
    }

    if (typeof value === 'object') {
      return true;
    }

    return false;
  }

  matchesEnvironment(environment: string, value: string) {
    const parts = value.split('&').map(x => x.trim().toLowerCase());
    return parts.indexOf(environment) !== -1;
  }
};
