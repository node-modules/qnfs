/*!
 * qnfs - lib/utils.js
 * Copyright(c) 2013 fengmk2 <fengmk2@gmail.com> (http://fengmk2.github.com)
 * MIT Licensed
 */

"use strict";

/**
 * Module dependencies.
 */

exports.isDirPath = function (path) {
  return path && path[path.length - 1] === '/';
};

var DIR_FILENAME = '.__qnfs_dir';

exports.ensureDir = function (path) {
  if (path[path.length - 1] !== '/') {
    path += '/';
  }
  return path;
};

exports.dirMetaFile = function (path) {
  return exports.ensureDir(path) + DIR_FILENAME;
};
