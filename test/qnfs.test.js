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
var qnfs = require('../');

var CI_ENV = (process.env.TRAVIS ? 'TRAVIS' : process.env.CI_ENV) + '-' + process.version;
var fooFilePath = '/qnfs/test/fixtures/foo.txt.' + CI_ENV + '.txt';
var fixtures = path.join(__dirname, 'fixtures');

describe('qnfs.test.js', function () {
  before(function (done) {
    qnfs.config(require('./config.json'));
    qnfs.writeFile(fooFilePath, fs.readFileSync(path.join(fixtures, 'foo.txt')), done);
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
