var assert = require('assert');
var test   = require('tap').test;
var utils  = require('./utils');
var LVC    = require('../');

var MAX_DATA = 100;

var path = __dirname + '/.testdbs/read_stream'
var db = utils.setup(path, 'node1');

test('puts several', function(t) {
  for (var i = 1; i <= MAX_DATA; i ++) {
    var padded = pad(i);
    db.put('key' + padded, 'value' + padded, onPut);
  }

  var puts = 0;
  function onPut(err) {
    if (err) throw err;
    if (++ puts == MAX_DATA) t.end();
  }

});

test('gets a full read stream', function(t) {
  var s = db.createReadStream();
  s.on('data', onData);

  var datas = 1;
  function onData(d) {
    var padded = pad(datas);
    var expected = {
      key: 'key' + padded,
      value: 'value' + padded,
      meta: {
        clock: {
          node1: 1
        }
      }
    };

    t.deepEqual(d, [expected]);
    if (++ datas > MAX_DATA) t.end();
  }
});

test('closes', function(t) {
  db.close(t.end.bind(t));
});


function pad(n) {
  var s = n.toString();
  if (n < 10)  s = '0' + s;
  if (n < 100) s = '0' + s;
  return s;
}