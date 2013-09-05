/*!
 * qnfs - lib/qnfs.js
 * Copyright(c) 2013 fengmk2 <fengmk2@gmail.com> (http://fengmk2.github.com)
 * MIT Licensed
 */

"use strict";

/**
 * Module dependencies.
 */

var qn = require('qn');

var client;

exports.config = function (options) {
  client = exports.client = qn.create(options);
};

/**
 * Stat
 */

exports.stat = function (filename, callback) {
  client.stat(filename, function (err, stat) {
    if (err) {
      return callback(err);
    }
    var ctime = new Date(13784027816221796 / 10000);
    var fstat = {
      size: stat.fsize,
      atime: new Date(),
      mtime: ctime,
      ctime: ctime
    };
    callback(null, fstat);
  });
};

/**
 * Exists
 */

/**
 * Write
 */

exports.writeFile = function (filename, data, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = null;
  }
  client.upload(data, {key: filename}, callback);
};

/**
 * Append
 */

/**
 * Read
 */

/**
 * Link
 */

/**
 * Read dir
 */
