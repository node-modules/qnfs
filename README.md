qnfs [![Build Status](https://secure.travis-ci.org/fengmk2/qnfs.png)](http://travis-ci.org/fengmk2/qnfs) [![Coverage Status](https://coveralls.io/repos/fengmk2/qnfs/badge.png)](https://coveralls.io/r/fengmk2/qnfs) [![Build Status](https://drone.io/github.com/fengmk2/qnfs/status.png)](https://drone.io/github.com/fengmk2/qnfs/latest)
=======

![logo](https://raw.github.com/fengmk2/qnfs/master/logo.png)

Network Node.js [fs](http://nodejs.org/api/fs.html) module base on [qn](https://github.com/fengmk2/qn)

## Install

```bash
$ npm install qnfs
```

## Usage

```js
var fs = require('qnfs');
fs.config({
  accessKey: 'your access key',
  secretKey: 'your secret key',
  bucket: 'your bucket name',
  // timeout: 3600000, // default rpc timeout: one hour, optional
});

fs.stat('/qnfs/README.md', function (err, stat) {
  console.log(stat);
  // size: 527,
  // atime: Mon, 10 Oct 2011 23:24:11 GMT,
  // mtime: Mon, 10 Oct 2011 23:24:11 GMT,
  // ctime: Mon, 10 Oct 2011 23:24:11 GMT
});
```

## Documents

### `fs.stat(path, callback)`

### `fs.writeFile(filename, data, [options], callback)`

### `fs.readFile(filename, [options], callback)`

### `fs.appendFile(filename, data, [options], callback)`

### `fs.rename(oldPath, newPath, callback)`

### `fs.truncate(path, len, callback)`

### `fs.unlink(path, callback)`

### `fs.mkdir(path, [mode], callback)`

### `fs.readdir(path, callback)`

### `fs.rmdir(path, callback)`

### `fs.utimes(path, atime, mtime, callback)`

### `fs.exists(path, callback)`

### `fs.createReadStream(path, [options])`

### `fs.createWriteStream(path, [options])`

## TODO

* [ ] All async APIs on [Node.js fs](http://nodejs.org/api/fs.html)

## Authors

```bash
$ git summary 

 project  : qnfs
 repo age : 4 days
 active   : 3 days
 commits  : 13
 files    : 15
 authors  : 
    13  fengmk2                 100.0%
```

## License 

(The MIT License)

Copyright (c) 2013 fengmk2 &lt;fengmk2@gmail.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
