const os = require('os');
const c = require('ansi-colors');
const {wordWrap} = require('enquirer/lib/utils');

exports.buildFromMetadata = function(metadata, width) {
  let text = '';
  metadata.forEach(json => text += transformCommandToStyledText(json, width));
  return text;
};

function transformCommandToStyledText(json, width) {
  const indent = ' '.repeat(4);

  let text = c.magenta.bold(json.name);
  width = width || 1000;

  if (json.parameters) {
    json.parameters.forEach(parameter => {
      if (parameter.optional) {
        text += ' ' + c.dim(parameter.name);
      } else {
        text += ' ' + parameter.name;
      }
    });
  }

  if (json.flags) {
    json.flags.forEach(flag => {
      text += ' ' + c.yellow('--' + flag.name);

      if (flag.type !== 'boolean') {
        text += ' value';
      }
    });
  }

  text += os.EOL + os.EOL;
  text += wordWrap(json.description, {indent, width});

  if (json.parameters) {
    json.parameters.forEach(parameter => {
      text += os.EOL + os.EOL;
      let parameterInfo = parameter.name;

      if (parameter.optional) {
        parameterInfo += ' (optional)';
      }

      parameterInfo = c.blue(parameterInfo) + ' - ' + parameter.description;
      text += wordWrap(parameterInfo, {indent, width});
    });
  }

  if (json.flags) {
    json.flags.forEach(flag => {
      text += os.EOL + os.EOL;
      let flagInfo = c.yellow('--' + flag.name);
      flagInfo += ' - ' + flag.description;
      text += wordWrap(flagInfo, {indent, width});
    });
  }

  text += os.EOL + os.EOL;

  return text;
}

