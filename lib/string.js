"use strict";
const os = require("os");
const transform = require('./colors/transform');

exports.sluggify = function(str) {
  return str.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
};

exports.lowerCamelCase = function(str) {
  return str.charAt(0).toLowerCase() + str.slice(1).replace(/[_.-](\w|$)/g, (_, x) => x.toUpperCase());
};

exports.upperCamelCase = function(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/[_.-](\w|$)/g, (_, x) => x.toUpperCase());
};

exports.buildFromMetadata = function(metadata) {
  let text = '';
  metadata.forEach(json => text += transformCommandToStyledText(json));
  return text;
}

function transformCommandToStyledText(json) {
  const tab = '    ';
  let text = `<magenta><bold>${json.name}</bold></magenta>`;

  if (json.parameters) {
    json.parameters.forEach(parameter => {
      if (parameter.optional) {
        text += ' <dim><' + parameter.name + '></dim>';
      } else {
        text += ' ' + parameter.name;
      }
    });
  }

  text += os.EOL + os.EOL;
  text += tab + json.description;

  if (json.parameters) {
    json.parameters.forEach(parameter => {
      text += os.EOL + os.EOL;
      text += '<blue>' + tab + parameter.name;

      if (parameter.optional) {
        text += ' (optional)'
      }

      text += '</blue> - ' + parameter.description;
    });
  }

  text += os.EOL + os.EOL;

  return transform(text);
}
