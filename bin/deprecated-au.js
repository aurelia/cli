#!/usr/bin/env node

const c = require('ansi-colors');
const args = process.argv.slice(2);

console.log(c.yellow(`DEPRECATED: ${c.bgYellow.black(' au ')} has been deprecated in aurelia-cli v2. Plese use ${c.bgYellow.black(` ${['au1', ...args].join(' ')} `)} instead.`));
console.log(`We decided to reserve bin name ${c.bgWhite.black(' au ')} for upcoming Aurelia 2. More to come ...`);
process.exit(1);
