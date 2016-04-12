"use strict";
const fs = require('fs');

exports.Command = class {
  execute(args) {
    let fileLocation = require.resolve('./help.txt');
    fs.readFile(fileLocation, (error, data) => {
      if(!error) {
        console.log(data.toString());
      }
    });
  }
}
