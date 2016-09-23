'use strict';
var assert = require('assert');

function Codec(opts) {
    opts = opts || {};

    this.codec = opts.codec || Codec.Default.codec;

    assert.strictEqual(['json'].indexOf(this.codec) !== -1, true, 'unsupported codec');

    this.encode = function encode(obj) {
        return new Buffer(JSON.stringify(obj));
    };
    this.decode = function decode(buffer) {
        return JSON.parse(buffer.toString());
    };

}

Codec.Default = {
    codec: 'json'
};

module.exports = Codec;
