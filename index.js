var aurelia, DEV_ENV = parseInt(process.env.AURELIA_CLI_DEV_ENV, 10);

if (DEV_ENV) {
  aurelia = require('./src');
} else {
  aurelia = require('./dist');
}

module.exports = aurelia;
