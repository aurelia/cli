import * as tty from 'node:tty';

let size: { height: number; width: number };

export function getTtySize() {
  // Only run it once.
  if (size) return size;

  let width: number;
  let height: number;

  if (tty.isatty(1) && tty.isatty(2)) {
    if (process.stdout.getWindowSize) {
      [width, height] = process.stdout.getWindowSize();
    } else if ('getWindowSize' in tty && typeof tty.getWindowSize === 'function') {
      [height, width] = tty.getWindowSize();
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
