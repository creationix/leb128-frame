"use strict";

// imports
var bops = require('bops');
var ln128 = Math.log(128);

// exports
framer.is = "min-stream-push-filter";
exports.framer = framer;
deframer.is = "min-stream-push-filter";
exports.deframer = deframer;

// Helper
function $write(fn) {
  fn.is = "min-stream-write";
  return fn;
}

// A push-filter that accepts messages as binary items
// emits length headers and messages
function framer(emit) {
  return $write(function (err, item) {
    if (item === undefined) return emit(err);
    var length = item.length;
    var bytes = Math.floor(Math.log(length) / ln128) + 1;
    var header = bops.create(bytes);
    var pow = 1;
    for (var i = 0; i < bytes; i++) {
      header[bytes - i - 1] = ((length / pow) & 0x7f) | 0x80;
      pow *= 128;
    }
    header[bytes - 1] &= 0x7f;
    emit(null, header);
    emit(null, item);
  });
}

// A push-filter that accepts arbitrarly sized binary chunks
// Reads message length headers and emits whole message itens
function deframer(emit) {
  var head = true;
  var length = 0;
  var parts = [];

  return $write(function (err, item) {
    if (item === undefined) return emit(err);
    for (var i = 0, l = item.length; i < l; i++) {
      var c = item[i];
      if (head) {
        length = (length * 128) + (c & 0x7f);
        if (!(c & 0x80)) {
          head = false;
        }
      }
      else {
        // If we need more bytes than are left on this chunk, simply store it.
        if (length > l - i) {
          parts.push(bops.subarray(item, i));
          length -= l - i;
          break;
        }
        // Otherwise store the bytes and flush.
        else {
          parts.push(bops.subarray(item, i, i + length));
          i += length - 1; // -1 to counteract the i++ in the loop head
          var output = bops.join(parts);
          parts.length = 0;
          length = 0;
          head = true;
          emit(null, output);
        }
      }
    }
  });
}

