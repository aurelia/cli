"use strict";

const UI = require('../../ui').UI,
      path = require('path'),
      glob = require('glob');

let ResourceInclusion = class {

  static inject() { return [UI, 'package']; };

  constructor(ui, pkg) {
    this.ui = ui;
    this.package = pkg;
  }

  getCSS() {
    let globExpr = '?(dist|build|lib|css|style|styles})/**/*.css';

    return this.getResources(globExpr)
    .then(cssFiles => {
      if (cssFiles.length === 0) {
        return [];
      }

      let question = `The importer has found ${cssFiles.length} css file(s). Do you want to include some?`;
      let options = [
        {
          displayName: 'Yes',
          description: 'I want choose which css files I need'
        },
        {
          displayName: 'No',
          description: 'I do not need css files'
        }
      ];
      return this.ui.question(question, options)
      .then(answer => {
        if (answer.displayName === 'Yes') {
          let options = cssFiles.map(x => { 
            return {
              displayName: x
            };
          });

          return this.ui.multiselect('What files do you need?', options)
          .then(answers => answers.map(x => x.displayName));
        }

        return [];
      });
    });
  }

  getResources(globExpr) {
    return this.glob(globExpr, { cwd: this.package.rootPath })
    .then(files => files.map(file => path.posix.join(file)));
  }

  glob(globExpr, options) {
    return new Promise((resolve, reject) => {
      glob(globExpr, options, function (er, files) {
        if (er) {
          reject(er);
        }
        resolve(files);
      });
    });
  }
};

module.exports = ResourceInclusion;
