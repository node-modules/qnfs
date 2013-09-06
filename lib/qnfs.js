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
var Stat = require('./stat');

var client;

exports.config = function (options) {
  client = exports.client = qn.create(options);
};

/**
 * Stat
 */

exports.stat = function (filename, callback) {
  client.stat(filename, function (err, info) {
    if (err) {
      return callback(err);
    }
    callback(null, new Stat(info));
  });
};

function isDirPath(path, callback) {
  return path && path[path.length - 1] === '/';
}

/**
 * Exists
 */

/**
 * Test whether or not the given dir path exists by checking with the file system. 
 * Then call the callback argument with either true or false.
 * 
 * @param {String} path dir path, must end with "/", e.g.: "/foo/", "/foo/bar/"
 * @param {Function(exists)} callback
 *  - {Boolean} exists
 */
exports.existsDir = function (path, callback) {
  if (!isDirPath(path)) {
    return callback(false);
  }
  client.list({prefix: path, limit: 1}, function (err, result) {
    callback(!err && result && result.items && result.items.length > 0);
  });
};

/**
 * Test whether or not the given path exists by checking with the file system. 
 * Then call the callback argument with either true or false.
 * 
 * @param {String} path if you want to test dir path, must end with "/", e.g.: "/foo/", "/foo/bar/"
 * @param {Function(exists)} callback
 *  - {Boolean} exists
 */
exports.exists = function (path, callback) {
  if (isDirPath(path)) {
    return exports.existsDir(path, callback);
  }

  exports.stat(path, function (err, stat) {
    callback(!err && !!stat);
  });
};

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


