"use strict";

var leb128 = require('./.');
var bops = require('bops');
var helpers = require('min-stream-helpers');
var test = require('tape');

// Some canned data manually broken up at weird places to test deframing logic
var chunked = [
  "0548656c6c6f",
  "05576f726c640548",
  "656c6c6f05576f726c64",
  "05",
  "48",
  "656c",
  "6c6f",
  "05576f",
  "726c64",
  "81",
  "4800",
  "010203",
  "04050607",
  "08090a0b0c",
  "0d0e0f101112",
  "13141516171819",
  "1a1b1c1d1e1f2021",
  "22232425262728292a",
  "2b2c2d2e2f3031323334",
  "35363738393a3b3c3d3e3f",
  "404142434445464748494a4b",
  "4c4d4e4f505152535455565758",
  "595a5b5c5d5e5f60616263646566",
  "6768696a6b6c6d6e6f707172737475",
  "767778797a7b7c7d7e7f808182838485",
  "868788898a8b8c8d8e8f90919293949596",
  "9798999a9b9c9d9e9fa0a1a2a3a4a5a6a7a8",
  "a9aaabacadaeafb0b1b2b3b4b5b6b7b8b9babb",
  "bcbdbebfc0c1c2c3c4c5c6c7"
];

var messages = [
  "48656c6c6f",
  "576f726c64",
  "48656c6c6f",
  "576f726c64",
  "48656c6c6f",
  "576f726c64",
  "000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f404142434445464748494a4b4c4d4e4f505152535455565758595a5b5c5d5e5f606162636465666768696a6b6c6d6e6f707172737475767778797a7b7c7d7e7f808182838485868788898a8b8c8d8e8f909192939495969798999a9b9c9d9e9fa0a1a2a3a4a5a6a7a8a9aaabacadaeafb0b1b2b3b4b5b6b7b8b9babbbcbdbebfc0c1c2c3c4c5c6c7"
];

var framed = [
  "05",
  "48656c6c6f",
  "05",
  "576f726c64",
  "05",
  "48656c6c6f",
  "05",
  "576f726c64",
  "05",
  "48656c6c6f",
  "05",
  "576f726c64",
  "8148",
  "000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f404142434445464748494a4b4c4d4e4f505152535455565758595a5b5c5d5e5f606162636465666768696a6b6c6d6e6f707172737475767778797a7b7c7d7e7f808182838485868788898a8b8c8d8e8f909192939495969798999a9b9c9d9e9fa0a1a2a3a4a5a6a7a8a9aaabacadaeafb0b1b2b3b4b5b6b7b8b9babbbcbdbebfc0c1c2c3c4c5c6c7"
];


function toBinary(string) {
  return bops.from(string, "hex");
}

function toString(binary) {
  return bops.to(binary, "hex");
}

test('decoder works as expected', function(assert) {

  helpers.run([
    chunked.map(toBinary),
    leb128.deframer,
    helpers.consume(onDeframed)
  ]);

  function onDeframed(err, items) {
    if (err) throw err;
    items = items.map(toString);
    items.forEach(function (item, i) {
      assert.equal(item, messages[i]);
    });
    assert.equal(items.length, messages.length);
    assert.end();
  }

});

test('encoder works as expected', function(assert) {

  helpers.run([
    messages.map(toBinary),
    leb128.framer,
    helpers.consume(onFramed)
  ]);

  function onFramed(err, items) {
    if (err) throw err;
    items = items.map(toString);
    items.forEach(function (item, i) {
      assert.equal(item, framed[i]);
    });
    assert.equal(items.length, framed.length);
    assert.end();
  }

});
