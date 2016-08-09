/* Copyright 2010 James Halliday (mail@substack.net)

This project is free software released under the MIT/X11 license:

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE. */
"use strict";
const path = require('path');
const fs = require('fs');
const _0777 = parseInt('0777', 8);

function mkdirp (p, opts, f, made) {
  if (typeof opts === 'function') {
    f = opts;
    opts = {};
  }
  else if (!opts || typeof opts !== 'object') {
    opts = { mode: opts };
  }
  
  var mode = opts.mode;
  var xfs = opts.fs || fs;
  
  if (mode === undefined) {
    mode = _0777 & (~process.umask());
  }
  if (!made) made = null;
  
  var cb = f || function () {};
  p = path.resolve(p);
  
  xfs.mkdir(p, mode, function (er) {
    if (!er) {
      made = made || p;
      return cb(null, made);
    }
    switch (er.code) {
      case 'ENOENT':
        mkdirp(path.dirname(p), opts, function (er, made) {
          if (er) cb(er, made);
          else mkdirp(p, opts, cb, made);
        });
        break;

      // In the case of any other error, just see if there's a dir
      // there already.  If so, then hooray!  If not, then something
      // is borked.
      default:
        xfs.stat(p, function (er2, stat) {
          // if the stat fails, then that's super weird.
          // let the original error be the failure reason.
          if (er2 || !stat.isDirectory()) cb(er, made)
          else cb(null, made);
        });
        break;
    }
  });
}

exports.mkdirp = mkdirp;
