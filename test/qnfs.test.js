/*!
 * qnfs - test/qnfs.test.js
 * Copyright(c) 2013 fengmk2 <fengmk2@gmail.com> (http://fengmk2.github.com)
 * MIT Licensed
 */

"use strict";

/**
 * Module dependencies.
 */

var path = require('path');
var fs = require('fs');
var should = require('should');
var pedding = require('pedding');
var qnfs = require('../');

var fixtures = path.join(__dirname, 'fixtures');
var CI_ENV = (process.env.TRAVIS ? 'TRAVIS' : process.env.CI_ENV) + '-' + process.version;
var fooFilePath = '/qnfs/test/fixtures/foo.txt.' + CI_ENV + '.txt';
var fooContent = fs.readFileSync(path.join(fixtures, 'foo.txt'));

describe('qnfs.test.js', function () {
  qnfs.config(require('./config.json'));

  before(function (done) {
    qnfs.writeFile(fooFilePath, fooContent, done);
  });

  describe('exists()', function () {
    it('should return true when file exists', function (done) {
      qnfs.exists(fooFilePath, function (exists) {
        exists.should.equal(true);
        done();
      });
    });

    it('should return false when file not exists', function (done) {
      qnfs.exists('/qnfs/test/fixtures/foo_not_exists.txt', function (exists) {
        exists.should.equal(false);
        done();
      });
    });

    it('should return true when dir exists', function (done) {
      qnfs.exists('/qnfs/test/fixtures/', function (exists) {
        exists.should.equal(true);
        done();
      });
    });

    it('should return false when dir not exists', function (done) {
      qnfs.exists('/qnfs/test/fixtures_not_exists/', function (exists) {
        exists.should.equal(false);
        done();
      });
    });
  });

  describe('rename()', function () {
    beforeEach(function (done) {
      done = pedding(2, done);
      qnfs.writeFile(fooFilePath + '.rename', fooContent, done);
      qnfs.unlink(fooFilePath + '.newname', function () {
        done();
      });
    });

    it('should rename a exists file', function (done) {
      qnfs.rename(fooFilePath + '.rename', fooFilePath + '.newname', function (err) {
        should.not.exist(err);
        qnfs.exists(fooFilePath + '.newname', function (exists) {
          exists.should.equal(true);
          done();
        });
      });
    });

    it('should rename same file work', function (done) {
      qnfs.rename(fooFilePath + '.rename', fooFilePath + '.rename', function (err) {
        should.not.exist(err);
        done();
      });
    });

    it('should rename not exists file return err', function (done) {
      qnfs.rename(fooFilePath + '.not-exists', fooFilePath + '.newname', function (err) {
        should.exist(err);
        err.name.should.equal('QiniuFileNotExistsError');
        err.message.should.equal('no such file or directory');
        // err.message.should.equal("ENOENT, rename '" + fooFilePath + '.not-exists' + "'");
        // console.log(err)
        done();
      });
    });
  });

  describe('mkdir()', function () {
    var dirpath = '/qnfs/test/mkdir' + CI_ENV;
    beforeEach(function (done) {
      qnfs.rmdir(dirpath, function (err) {
        done();
      });
    });

    it('should mkdir success', function (done) {
      qnfs.mkdir(dirpath, function (err, r) {
        should.not.exist(err);
        qnfs.readFile(r.key, function (err, data) {
          should.not.exists(err);
          var meta = JSON.parse(data);
          meta.should.have.keys('mode', 'path', 'ctime');
          meta.path.should.equal(dirpath + '/');
          meta.ctime.should.be.a('number');
          should.not.exist(meta.mode);
          done();
        });
      });
    });

    it('should mkdir mode:0666 success', function (done) {
      qnfs.mkdir(dirpath, '0666', function (err, r) {
        should.not.exist(err);
        qnfs.readFile(r.key, function (err, data) {
          should.not.exists(err);
          var meta = JSON.parse(data);
          meta.should.have.keys('mode', 'path', 'ctime');
          meta.path.should.equal(dirpath + '/');
          meta.ctime.should.be.a('number');
          meta.mode.should.equal('0666');
          done();
        });
      });
    });
  });

  describe('readdir()', function () {
    before(function (done) {
      done = pedding(7, done);
      qnfs.writeFile('/qnfs/test/readdir/foo.txt', fooContent, done);
      qnfs.writeFile('/qnfs/test/readdir/.foobar.txt', fooContent, done);
      qnfs.writeFile('/qnfs/test/readdir/subdir2/foo2.txt', fooContent, done);
      qnfs.writeFile('/qnfs/test/readdir/subdir2/foo3.txt', fooContent, done);
      qnfs.mkdir('/qnfs/test/readdir/subdir1', function () {
        done();
      });
      qnfs.mkdir('/qnfs/test/readdir/subdir1/subsubdir1', function () {
        done();
      });
      qnfs.mkdir('/qnfs/test/readdir/subdir2/subsubdir1/subdir3', function () {
        done();
      });
    });

    it('should return current dir all file and subdir names', function (done) {
      qnfs.readdir('/qnfs/test/readdir', function (err, names) {
        should.not.exist(err);
        should.exist(names);
        names.should.length(4);
        names.should.eql(['.foobar.txt', 'foo.txt', 'subdir1', 'subdir2']);
        done();
      });
    });

    it('should return []', function (done) {
      qnfs.readdir('/qnfs/test/readdir/subdir2/subsubdir1/subdir3', function (err, names) {
        should.not.exist(err);
        names.should.eql([]);
        done();
      });
    });

    it('should return error when dir not exists', function (done) {
      qnfs.readdir('/qnfs/test/readdir/not_exists', function (err) {
        should.exist(err);
        err.name.should.equal('Error');
        err.message.should.equal("ENOENT, readdir '/qnfs/test/readdir/not_exists/'");
        err.errno.should.equal(34);
        err.code.should.equal('ENOENT');
        done();
      });
    });
  });

  describe('writeFile()', function () {
    it('should return err when write a dir', function (done) {
      qnfs.writeFile('/tmp/', 'ddd', function (err) {
        should.exist(err);
        done();
      });
    });
  });

  describe('appendFile()', function () {
    before(function (done) {
      done = pedding(3, done);
      qnfs.unlink(fooFilePath + '.appendFile', function () {
        qnfs.writeFile(fooFilePath + '.appendFile', fooContent, done);
      });
      qnfs.unlink(fooFilePath + '.appendFile.empty', function () {
        qnfs.writeFile(fooFilePath + '.appendFile.empty', '', done);
      });      
      qnfs.unlink(fooFilePath + '.appendFile.not_exists', function () {
        done();
      });
    });

    it('should append content to not exists file', function (done) {
      qnfs.appendFile(fooFilePath + '.appendFile.not_exists', 'new content', function (err) {
        should.not.exist(err);
        qnfs.readFile(fooFilePath + '.appendFile.not_exists', function (err, data) {
          should.not.exist(err);
          data.toString().should.equal('new content');
          done();
        });
      });
    });

    it('should append content to exists file', function (done) {
      qnfs.appendFile(fooFilePath + '.appendFile', 'new content', function (err) {
        should.not.exist(err);
        qnfs.readFile(fooFilePath + '.appendFile', function (err, data) {
          should.not.exist(err);
          data.toString().should.equal('This is a foo content.new content');
          done();
        });
      });
    });

    it('should append content to exists empty file', function (done) {
      qnfs.appendFile(fooFilePath + '.appendFile.empty', 'new content', function (err) {
        should.not.exist(err);
        qnfs.readFile(fooFilePath + '.appendFile.empty', function (err, data) {
          should.not.exist(err);
          data.toString().should.equal('new content');
          done();
        });
      });
    });

    it('should return err when append to dir', function (done) {
      qnfs.appendFile('/tmp/', 'ddddd', function (err) {
        should.exist(err);
        done();
      });
    });
  });

  describe('readFile()', function () {
    it('should return file content buffer', function (done) {
      qnfs.readFile(fooFilePath, function (err, content) {
        should.not.exist(err);
        should.ok(Buffer.isBuffer(content));
        content.toString().should.equal(fooContent.toString());
        done();
      });
    });

    it('should return file content string', function (done) {
      qnfs.readFile(fooFilePath, 'utf8', function (err, content) {
        should.not.exist(err);
        content.should.be.a('string');
        content.should.equal(fooContent.toString());
        done();
      });
    });

    it('should return error when file not exists', function (done) {
      qnfs.readFile(fooFilePath + '_not_exists', 'utf8', function (err, content) {
        should.exist(err);
        err.name.should.equal('QiniuNotFoundError');
        err.message.should.equal("ENOENT, open '" + fooFilePath + '_not_exists' + "'");
        err.errno.should.equal(34);
        err.code.should.equal('ENOENT');
        done();
      });
    });

    it('should return error when filename is dir', function (done) {
      qnfs.readFile('/tmp/', 'utf8', function (err, content) {
        should.exist(err);
        err.name.should.equal('Error');
        err.message.should.equal("EISDIR, read");
        err.errno.should.equal(28);
        err.code.should.equal('EISDIR');
        done();
      });
    });
  });

  describe('unlink()', function () {
    before(function (done) {
      qnfs.writeFile(fooFilePath + '.unlink', fooContent, done);
    });

    it('should unlink a file', function (done) {
      qnfs.exists(fooFilePath + '.unlink', function (exists) {
        should.ok(exists);
        qnfs.unlink(fooFilePath + '.unlink', function (err) {
          should.not.exists(err);
          qnfs.exists(fooFilePath + '.unlink', function (exists) {
            exists.should.equal(false);
            done();
          });
        });
      });
    });

    it('should unlink a not exists return error', function (done) {
      qnfs.unlink(fooFilePath + '.unlink_not_exists', function (err) {
        should.exists(err);
        err.name.should.equal('QiniuFileNotExistsError');
        err.message.should.equal("ENOENT, unlink '" + fooFilePath + '.unlink_not_exists' + "'");
        err.errno = 34;
        err.code = 'ENOENT';
        done();
      });
    });

    it('should unlink a dir return error', function (done) {
      qnfs.unlink('/tmp/', function (err) {
        should.exists(err);
        err.name.should.equal('Error');
        err.message.should.equal("EACCES, unlink '/tmp/'");
        err.errno = 3;
        err.code = 'EACCES';
        err.path.should.equal('/tmp/');
        done();
      });
    });
  });

  describe('stat()', function () {
    it('should get a file stat', function (done) {
      qnfs.stat(fooFilePath, function (err, stat) {
        should.not.exist(err);
        should.exist(stat);
        stat.should.have.keys('size', 'atime', 'mtime', 'ctime');
        stat.size.should.equal(fs.statSync(path.join(fixtures, 'foo.txt')).size);
        done();
      });
    });

    it('should return error when file not exists', function (done) {
      qnfs.stat('/qnfs/test/fixtures/foo.not.exists.txt', function (err, stat) {
        should.exist(err);
        err.name.should.equal('QiniuFileNotExistsError');
        err.message.should.equal('no such file or directory');
        should.not.exist(stat);
        done();
      });
    });
  });
});
