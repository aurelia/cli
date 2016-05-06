"use strict";

exports.sluggify = function(str) {
  return str.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
};

exports.upperCamelCase = function(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/[_.-](\w|$)/g, (_, x) => x.toUpperCase());
};

exports.removeSpaces = function(str) {
  return str.replace(/ /g,'');
}
