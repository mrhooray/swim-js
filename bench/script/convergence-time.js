#!/usr/bin/env node
'use strict';
var cp = require('child_process');
var metrics = require('metrics');
var program = require('commander');

var Runner = require('../lib/runner');
var singleNodeFailure = require('../scenario/single-node-failure');

var PORT_BASE = 20000;

if (require.main === module) {
    parseArgs();
    main();
}

function parseArgs() {
    program
    .option('--cycles [value]', 'number of cycles', parseInt, 10)
    .option('--workers [value]', 'number of workers', parseInt, 10)
    .option('--codec [value]', 'json', 'json')
    .option('--dissemination-factor [value]', 'dissemination factor', parseInt, 15)
    .option('--interval [value]', 'interval', parseInt, 20)
    .option('--join-timeout [value]', 'join timeout', parseInt, 100)
    .option('--ping-timeout [value]', 'ping timeout', parseInt, 4)
    .option('--ping-req-timeout [value]', 'ping req timeout', parseInt, 12)
    .option('--ping-req-group-size [value]', 'ping req group size', parseInt, 3)
    .option('--max-dgram-size [value]', 'max dgram size', parseInt, 512)
    .parse(process.argv);

    console.log('configuration:');
    console.log('- cycles', program.cycles);
    console.log('- workers', program.workers);
    console.log('- codec', program.codec);
    console.log('- dissemination factor', program.disseminationFactor);
    console.log('- interval', program.interval, 'ms');
    console.log('- join timeout', program.joinTimeout, 'ms');
    console.log('- ping timeout', program.pingTimeout, 'ms');
    console.log('- ping req timeout', program.pingReqTimeout, 'ms');
    console.log('- ping req group size', program.pingReqGroupSize);
    console.log('- max dgram size', program.maxDgramSize, 'bytes');
}

function main() {
    var histogram = new metrics.Histogram();
    var context = {
        hostToAliveWorker: Object.create(null),
        hostToFaultyWorker: Object.create(null),
        hostToChecksum: Object.create(null),
        numberOfWorkers: program.workers
    };
    var runner = new Runner({
        cycles: program.cycles,
        setup: setup.bind(undefined, context),
        teardown: teardown.bind(undefined, context),
        suite: {
            before: before.bind(undefined, context),
            fn: fn.bind(undefined, context),
            after: after.bind(undefined, context)
        }
    });
    var time;

    runner.on(Runner.EventType.Fn, function onCycleStart() {
        time = Date.now();
    });
    runner.on(Runner.EventType.After, function onCycleComplete() {
        histogram.update(Date.now() - time);
    });

    console.log('convergence time under single node failure');

    runner.run(function report() {
        var result = histogram.printObj();

        console.log('histogram data:');
        console.log('- count', result.count);
        console.log('- min', result.min);
        console.log('- max', result.max);
        console.log('- mean', result.mean);
        console.log('- median', result.median);
        console.log('- variance', result.variance);
        /* jshint camelcase: false */
        console.log('- std dev', result.std_dev);
        /* jshint camelcase: true */
        console.log('- p75', result.p75);
        console.log('- p95', result.p95);
        console.log('- p99', result.p99);
    });
}

function setup(context, callback) {
    var readyCount = 0;

    fork(context, function onMessage(message) {
        switch (message.type) {
            case 'ready':
                readyCount += 1;
                if (readyCount === context.numberOfWorkers) {
                    Object.keys(context.hostToAliveWorker).forEach(function join(host) {
                        context.hostToAliveWorker[host].send({
                            cmd: 'join',
                            hosts: getHostsToJoin(Math.ceil(context.numberOfWorkers / 3))
                        });
                    });
                    waitForConvergence(context, callback);
                }
                break;
            case 'checksum':
                context.hostToChecksum[message.host] = message.value;
                break;
        }
    });
}

function fork(context, onMessage) {
    var args;
    var host;
    var worker;
    var i;

    for (i = 0; i < context.numberOfWorkers; i++) {
        host = '127.0.0.1:' + (PORT_BASE + i);
        args = [];
        args.push('--host', host);
        if (program.codec) {
            args.push('--codec', program.codec);
        }
        if (program.disseminationFactor) {
            args.push('--dissemination-factor', program.disseminationFactor);
        }
        if (program.interval) {
            args.push('--interval', program.interval);
        }
        if (program.joinTimeout) {
            args.push('--join-timeout', program.joinTimeout);
        }
        if (program.pingTimeout) {
            args.push('--ping-timeout', program.pingTimeout);
        }
        if (program.pingReqTimeout) {
            args.push('--ping-req-timeout', program.pingReqTimeout);
        }
        if (program.pingReqGroupSize) {
            args.push('--ping-req-group-size', program.pingReqGroupSize);
        }
        if (program.maxDgramSize) {
            args.push('--max-dgram-size', program.maxDgramSize);
        }

        worker = cp.fork(__dirname + '/worker.js', args);
        worker.on('message', onMessage);
        context.hostToAliveWorker[host] = worker;
    }
}

function getHostsToJoin(n) {
    var hostToJoin = [];
    var i;

    for (i = 0; i < n; i++) {
        hostToJoin.push('127.0.0.1:' + (PORT_BASE + i));
    }

    return hostToJoin;
}

function waitForConvergence(context, callback) {
    var handle = setInterval(function check() {
        var hosts = Object.keys(context.hostToAliveWorker);
        var i;

        for (i = 1; i < hosts.length; i++) {
            if (!context.hostToChecksum[hosts[i]] ||
                context.hostToChecksum[hosts[i - 1]] !== context.hostToChecksum[hosts[i]]) {
                return;
            }
        }

        if (Object.keys(context.hostToChecksum).length >= Object.keys(context.hostToAliveWorker).length) {
            context.hostToChecksum = Object.create(null);
            clearInterval(handle);
            callback();
        }
    }, 5);
}

function teardown(context, callback) {
    Object.keys(context.hostToAliveWorker).forEach(function shutdown(host) {
        context.hostToAliveWorker[host].send({
            cmd: 'shutdown'
        });
    });
    process.nextTick(callback);
}

function before(context, callback) {
    singleNodeFailure(context, callback);
}

function fn(context, callback) {
    waitForConvergence(context, callback);
}

function after(context, callback) {
    Object.keys(context.hostToFaultyWorker).forEach(function join(host) {
        context.hostToAliveWorker[host] = context.hostToFaultyWorker[host];
        delete context.hostToFaultyWorker[host];
        context.hostToAliveWorker[host].send({
            cmd: 'bootstrap',
            hosts: getHostsToJoin(Math.ceil(context.numberOfWorkers / 3))
        });
    });
    waitForConvergence(context, callback);
}
