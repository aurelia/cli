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

exports.buildFromMetadata = function(metadata, width) {
  let text = '';
  metadata.forEach(json => text += transformCommandToStyledText(json, width));
  return text;
}

exports.createLines = createLines;

function transformCommandToStyledText(json, width) {
  const tabSize = '    ';
  let currentIndent = tabSize;

  let text = `<magenta><bold>${json.name}</bold></magenta>`;
  width = width || 1000;

  if (json.parameters) {
    json.parameters.forEach(parameter => {
      if (parameter.optional) {
        text += ' <dim><' + parameter.name + '></dim>';
      } else {
        text += ' ' + parameter.name;
      }
    });
  }

  if (json.flags) {
    json.flags.forEach(flag => {
      text += ' <yellow>--' + flag.name + '</yellow>';

      if (flag.type !== 'boolean') {
        text += ' value';
      }
    });
  }

  text += os.EOL + os.EOL;
  text += createLines(json.description, currentIndent, width);

  if (json.parameters) {
    json.parameters.forEach(parameter => {
      text += os.EOL + os.EOL;
      let parameterInfo = '<blue>' + parameter.name;

      if (parameter.optional) {
        parameterInfo += ' (optional)'
      }

      parameterInfo += '</blue> - ' + parameter.description;
      text += createLines(parameterInfo, currentIndent, width);
    });
  }

  if (json.flags) {
    json.flags.forEach(flag => {
      text += os.EOL + os.EOL;
      let flagInfo = '<yellow>--' + flag.name;
      flagInfo += '</yellow> - ' + flag.description;
      text += createLines(flagInfo, currentIndent, width);
    });
  }

  text += os.EOL + os.EOL;

  return transform(text);
}

function createLines(text, currentIndent, width) {
  let toAdd = currentIndent + text;

  if (toAdd.length > width) {
    let parts = text.split(' ');
    let lines = [];
    let currentLine = '';

    for (let i = 0, ii = parts.length; i < ii; ++i) {
      let potential = currentIndent + currentLine + ' ' + parts[i];

      if (potential.length > width) {
        lines.push(currentIndent + currentLine.trim());
        currentLine = parts[i];
      } else {
        currentLine = currentLine + ' ' + parts[i];
      }
    }

    lines.push(currentIndent + currentLine);
    toAdd = lines.join(os.EOL);
  }

  return toAdd;
}
