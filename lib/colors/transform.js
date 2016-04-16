"use strict";
const styles = require('./styles');
const supportsColor = require('./supports-colors');

function writeStyleOpen(name) {
  if (!styles[name]) {
    return `<${name}>`;
  }

  if (supportsColor) {
    return styles[name].open;
  }

  return '';
}

function writeStyleClose(name) {
  if (!styles[name]) {
    return `</${name}>`;
  }

  if (supportsColor) {
    return styles[name].close;
  }

  return '';
}

module.exports = function(text) {
  let final = '';
  let state = 'text';
  let tagName = '';

  for(let i = 0, ii = text.length; i < ii; ++i) {
    let current = text[i];

    if (current === '<' && state === 'text') {
      tagName = '';
      state = 'start-tag';
    } else if (current === '>' && (state === 'start-tag' || state === 'end-tag')) {
      if (state === 'start-tag') {
        final += writeStyleOpen(tagName);
      } else {
        final += writeStyleClose(tagName);
      }

      state = 'text';
    } else if (current === '/' && state === 'start-tag') {
      state = 'end-tag';
    } else if (state === 'start-tag' || state === 'end-tag') {
      tagName += current;
    } else {
      final += current;
    }
  }

  return final;
}
