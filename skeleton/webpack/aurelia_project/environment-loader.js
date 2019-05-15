const fs = require('fs');
const path = require('path');
const {
  getOptions
} = require('loader-utils');
const validateOptions = require('schema-utils');
const log = require('webpack-log');

const loaderName = 'environment-loader';
const logger = log({
  name: loaderName
});
const schema = {
  env: 'string'
};
const defaultOptions = {
  env: "development"
};

const parseFileContent = (content, filePath) => {
  try {
    return JSON.parse(content);
  } catch (e) {
    logger.error(`Unable to parse the file ${filePath}; ${loaderName} can only be used to load and transform json files.`);
  }
}

module.exports = function (source) {
  const options = Object.assign(defaultOptions, getOptions(this));
  validateOptions(schema, options, 'environment-loader');

  const ext = path.extname(this.resourcePath);
  const envFile = path.join(path.dirname(this.resourcePath), `${path.basename(this.resourcePath, ext)}.${options.env}${ext}`);
  let envConfig = {};

  if (fs.existsSync(envFile)) {
    envConfig = parseFileContent(fs.readFileSync(envFile), envFile);
  }
  const sourceConfig = parseFileContent(source, this.resourcePath);

  return JSON.stringify({
    ...sourceConfig,
    ...envConfig
  });
};
