'use strict';

const gitRegex = /(?:git|ssh|https?|git@[\w\.]+):(?:\/\/)?([\w\.@:\/~_-]+)\.git(?:\/?|\#[\d\w\.\-_]+?)$/;

class PackageArgumentParser {

  parse(args) {
    let packages = [];
    let flag = false;

    for (let i = 0; i < args.length; i++) {
      let arg = args[i];

      if (flag) {
        flag = false;
        continue;
      }

      // skip arguments starting with - or --
      if (arg.startsWith('--')) continue;
      if (arg.match(/^-.$/)) {
        flag = true;
        continue;
      }

      let pkg;

      if (this.isGitUrl(arg)) {
        pkg = this.parseGitUrl(arg);
      } else if (this.hasVersion(arg)) {
        pkg = this.parseVersioned(arg);
      } else {
        pkg = {
          argument: arg,
          name: arg
        };
      }
      packages.push(pkg);
    }

    return packages;
  }

  parseVersioned(argument) {
    let split = argument.split('@');
    return {
      argument: argument,
      name: split[0],
      version: split[1]
    };
  }

  hasVersion(argument) {
    return argument.indexOf('@') > -1;
  }

  isGitUrl(argument) {
    return argument.match(gitRegex);
  }

  parseGitUrl(argument) {
    let matches = argument.match(gitRegex);

    // github.com/aurelia/i18n
    let segment = matches[1];

    // aurelia/i18n
    let repo = segment.substring(segment.indexOf('/') + 1);

    // aurelia-i18n
    let name = repo.replace('/', '-');

    return {
      argument: argument,
      name: name
    };
  }
}

module.exports = PackageArgumentParser;
