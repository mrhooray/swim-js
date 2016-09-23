'use strict';
var test = require('tape');

var Codec = require('../lib/codec');

test('Codec constructs a codec instance', function t(assert) {
    assert.strictEqual(new Codec() instanceof Codec, true);
    assert.end();
});

test('Codec supports json', function t(assert) {
    assert.doesNotThrow(Codec.bind({}, {codec: 'json'}));
    assert.throws(Codec.bind({}, {codec: 'protobuf'}));
    assert.end();
});

test('Codec can decode data encoded by same codec', function t(assert) {
    var data = {foo: 'bar'};
    var jsonCodec = new Codec({codec: 'json'});

    assert.deepEqual(jsonCodec.decode(jsonCodec.encode(data)), data);
    assert.end();
});
