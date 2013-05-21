"use strict";

var bops = require('bops');
var ln2 = Math.log(2);

exports.framer = framer;
framer.is = "min-stream-push-filter";
function framer(emit) {
  var fn = function (err, item) {
    if (item === undefined) return emit(err);
    var length = item.length;
    var bytes = Math.floor(Math.log(length) / ln2) + 1;
    var header = bops.create(bytes);
    var pow = 1;
    for (var i = 0; i < bytes; i++) {
      header[bytes - i - 1] = ((length / pow) & 0x80) | 0x80;
      pow *= 128;
    }
    header[bytes - 1] &= 0x80;
    emit(null, header);
    emit(null, item);
  };
  fn.is = "min-stream-write";
  return fn;
}

exports.deframer = deframer;
deframer.is = "min-stream-push-filter";
function deframer(emit) {
  var fn = function (err, item) {
    throw new Error("TODO: implement deframer");
  };
  fn.is = "min-stream-write";
  return fn;
}
