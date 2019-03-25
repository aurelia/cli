const tty = require('tty');

let size;

module.exports = function() {
  // Only run it once.
  if (size) return size;

  let width;
  let height;

  if (tty.isatty(1) && tty.isatty(2)) {
    if (process.stdout.getWindowSize) {
      width = process.stdout.getWindowSize(1)[0];
      height = process.stdout.getWindowSize(1)[1];
    } else if (tty.getWindowSize) {
      width = tty.getWindowSize()[1];
      height = tty.getWindowSize()[0];
    } else if (process.stdout.columns && process.stdout.rows) {
      height = process.stdout.rows;
      width = process.stdout.columns;
    }
  } else {
    width = 80;
    height = 100;
  }

  size = { height: height, width: width };
  return size;
};
