/*!
 * qnfs - lib/qnfs.js
 * Copyright(c) 2013 fengmk2 <fengmk2@gmail.com> (http://fengmk2.github.com)
 * MIT Licensed
 */

"use strict";

/**
 * Module dependencies.
 */

var debug = require('debug')('qnfs');
var pathlib = require('path');
var qn = require('../../qn');
var Stat = require('./stat');
var utils = require('./utils');

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
  if (!utils.isDirPath(path)) {
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
  if (utils.isDirPath(path)) {
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
  exports.stat(filename, function (err, stat) {
    if (err && err.name !== 'QiniuFileNotExistsError') {
      return callback(err);
    }

    if (stat) {
      client.delete(filename, function (err) {
        if (err) {
          return callback(err);
        }

        client.upload(data, {key: filename}, callback);
      });
      return;
    }

    client.upload(data, {key: filename}, callback);
  });
};

/**
 * Append
 */

/**
 * Read
 */

/**
 * Asynchronously reads the entire contents of a file.
 * 
 * @param {String} filename
 * @param {Object} [options]
 *  - {String|Null} encoding default = null
 *  - {String} flag default = 'r'
 * @param {Function(err, data)} callback
 */
exports.readFile = function (filename, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = null;
  }

  var encoding = options;
  if (options && options.encoding) {
    encoding = options.encoding;
  }

  // read a dir
  // { [Error: EISDIR, read] errno: 28, code: 'EISDIR' }
  if (utils.isDirPath(filename)) {
    var err = new Error('EISDIR, read');
    err.errno = 28;
    err.code = 'EISDIR';
    return callback(err);
  }

  client.download(filename, function (err, data) {
    if (err) {
      // QiniuNotFoundError
      // { [Error: ENOENT, open 'sdfsdf'] errno: 34, code: 'ENOENT', path: 'sdfsdf' }
      if (err.name === 'QiniuNotFoundError') {
        err.message = 'ENOENT, open \'' + filename + '\'';
        err.code = 'ENOENT';
        err.errno = 34;
        err.path = filename;
      }
      return callback(err);
    }
    if (encoding) {
      data = data.toString(encoding);
    }
    callback(null, data);
  });
};


/**
 * Rename
 */

exports.rename = function (oldPath, newPath, callback) {
  debug('rename %s to %s', oldPath, newPath);

  // { [Error: ENOENT, rename 'foo'] errno: 34, code: 'ENOENT', path: 'foo' }
  client.move(oldPath, newPath, callback);
};

/**
 * Unlink
 */

exports.unlink = function (path, callback) {
  debug('unlink %s', path);
  // not exists: { [Error: ENOENT, unlink 'adawda'] errno: 34, code: 'ENOENT', path: 'adawda' }
  // unlink dir: { [Error: EACCES, unlink '/tmp'] errno: 3, code: 'EACCES', path: '/tmp' }
  if (utils.isDirPath(path)) {
    var err = new Error('EACCES, unlink \'' + path + '\'');
    err.errno = 3;
    err.code = 'EACCES';
    err.path = path;
    return callback(err);
  }
  client.delete(path, function (err) {
    if (err && (err.name === 'QiniuNotFoundError' || err.name === 'QiniuFileNotExistsError')) {
      err.message = 'ENOENT, unlink \'' + path + '\'';
      err.errno = 34;
      err.code = 'ENOENT';
      err.path = path;
    }
    callback(err);
  });
};

/**
 * Make dir
 */

exports.mkdir = function (path, mode, callback) {
  if (typeof mode === 'function') {
    callback = mode;
    mode = null;
  }

  path = utils.ensureDir(path);

  exports.existsDir(path, function (exists) {
    // errno: 47, code: 'EEXIST', path: 'test'
    if (exists) {
      var err = new Error("EEXIST, mkdir '" + path + "'");
      err.errno = 47;
      err.code = 'EEXIST';
      err.path = path;
      return callback(err);
    }

    var meta = {
      path: path,
      mode: mode,
      ctime: Date.now()
    };
    exports.writeFile(utils.dirMetaFile(path), JSON.stringify(meta), callback);
  });
};

/**
 * Remove dir
 */

exports.rmdir = function (path, callback) {
  path = utils.ensureDir(path);

  client.list({prefix: path, limit: 2}, function (err, result) {
    if (err) {
      return callback(err);
    }

    // { [Error: ENOENT, rmdir 'res22'] errno: 34, code: 'ENOENT', path: 'res22' }
    if (!result || result.items.length === 0) {
      err = new Error("ENOENT, rmdir '" + path + "'");
      err.errno = 34;
      err.code = 'ENOENT';
      err.path = path;
      return callback(err);
    }

    var metafile = utils.dirMetaFile(path);

    // not empty
    if (result.items.length > 2 || ('/' + result.items[0].key) !== metafile) {
      // { [Error: ENOTEMPTY, rmdir 'res'] errno: 53, code: 'ENOTEMPTY', path: 'res' }
      err = new Error("ENOTEMPTY, rmdir '" + path + "'");
      err.errno = 53;
      err.code = 'ENOTEMPTY';
      err.path = path;
      return callback(err);
    }

    // delete metafile
    exports.unlink(metafile, callback);
  });
};

/**
 * Read dir
 */

/**
 * Asynchronous readdir(3). Reads the contents of a directory. 
 * The callback gets two arguments (err, files) where files is an array of the names of the files 
 * in the directory excluding '.' and '..'.
 * 
 * @param {String} path
 * @param {Function(err, names)} callback
 */
exports.readdir = function (path, callback) {
  path = utils.ensureDir(path);
  // { [Error: ENOENT, readdir 'sdfsdf'] errno: 34, code: 'ENOENT', path: 'sdfsdf' }
  // { [Error: ENOTDIR, readdir 'test/config.json'] errno: 27, code: 'ENOTDIR', path: 'test/config.json' }
  client.list({prefix: path, limit: 1000}, function (err, result) {
    // TODO: read all files
    if (err) {
      return callback(err);
    }

    var items = result.items || [];
    if (items.length === 0) {
      err = new Error("ENOENT, readdir '" + path + "'");
      err.errno = 34;
      err.code = 'ENOENT';
      err.path = path;
      return callback(err);
    }

    var names = {};
    for (var i = 0; i < items.length; i++) {
      var key = '/' + items[i].key.trim();
      if (utils.isDirMetaFile(key)) {
        key = pathlib.dirname(key);
      }
      var name = key.substring(path.length);
      var index = name.indexOf('/');
      if (index > 0) {
        name = name.substring(0, index);
      }
      if (!name) {
        continue;
      }

      names[name] = 1;
    }
    callback(null, Object.keys(names));
  });
};
