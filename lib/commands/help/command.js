"use strict";
const fs = require('fs');
const transform = require('../../colors/transform');

exports.Command = class {
  execute(args) {
    let fileLocation = require.resolve('./help.txt');
    fs.readFile(fileLocation, (error, data) => {
      if(!error) {
        let text = transform(data.toString());
        console.log(text);
      }
    });
  }
}
