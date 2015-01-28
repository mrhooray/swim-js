'use strict';
var async = require('async');
var events = require('events');
var util = require('util');

function Runner(opts) {
    this.cycles = opts.cycles || 0;
    this.setup = opts.setup || noop;
    this.teardown = opts.teardown || noop;
    this.before = opts.suite.before || noop;
    this.fn = opts.suite.fn || noop;
    this.after = opts.suite.after || noop;
}

util.inherits(Runner, events.EventEmitter);

Runner.prototype.run = function run(callback) {
    var self = this;

    async.series([
        function setup(callback) {
            self.emit(Runner.EventType.Setup);
            self.setup(callback);
        },
        function run(callback) {
            async.timesSeries(self.cycles, function wrappedRun(i, callback) {
                async.series([
                    function before(callback) {
                        self.emit(Runner.EventType.Before);
                        self.before(callback);
                    },
                    function fn(callback) {
                        self.emit(Runner.EventType.Fn);
                        self.fn(callback);
                    },
                    function after(callback) {
                        self.emit(Runner.EventType.After);
                        self.after(callback);
                    }
                ], callback);
            }, callback);
        },
        function teardown(callback) {
            self.emit(Runner.EventType.Teardown);
            self.teardown(callback);
        }
    ], callback);
};

Runner.EventType = {
    After: 'after',
    Before: 'before',
    Fn: 'fn',
    Setup: 'setup',
    Teardown: 'teardown'
};

module.exports = Runner;

function noop(callback) {
    if (typeof callback === 'function') {
        process.nextTick(callback);
    }
}
