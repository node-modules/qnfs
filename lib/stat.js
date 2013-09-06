/*!
 * qnfs - lib/stat.js
 *
 * Impl fs.Stat all APIs: http://nodejs.org/docs/latest/api/fs.html#fs_class_fs_stats
 *
 * stats.isFile()
 * stats.isDirectory()
 * stats.isBlockDevice()
 * stats.isCharacterDevice()
 * stats.isSymbolicLink() (only valid with fs.lstat())
 * stats.isFIFO()
 * stats.isSocket()
 * 
 * Copyright(c) 2013 fengmk2 <fengmk2@gmail.com> (http://fengmk2.github.com)
 * MIT Licensed
 */

"use strict";

/**
 * Module dependencies.
 */

function Stat(info) {
  var ctime = new Date(info.putTime / 10000);
  this.size = info.fsize;
  this.atime = new Date();
  this.mtime = ctime;
  this.ctime = ctime;
}

Stat.prototype.isFile = function () {
  return true;
};

Stat.prototype.isDirectory =
Stat.prototype.isBlockDevice =
Stat.prototype.isCharacterDevice =
Stat.prototype.isSymbolicLink =
Stat.prototype.isFIFO =
Stat.prototype.isSocket = function () {
  return false;
};

module.exports = Stat;
