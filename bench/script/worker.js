#!/usr/bin/env node
'use strict';
var assert = require('assert');
var program = require('commander');

var Swim = require('../../');

if (require.main === module) {
    parseArgs();
    bootstrap(function onBootstrap(err, swim) {
        if (err) {
            console.log(err);
            process.exit(1);
        }

        handleMessage(swim);
    });
}

function parseArgs() {
    program
    .option('--host <value>', 'host')
    .option('--hosts-to-join [hosts]', 'hosts to join', function split(list) {
        return list.split(',');
    }, [])
    .option('--codec [value]', 'msgpack or json')
    .option('--dissemination-factor [value]', 'dissemination factor', parseInt)
    .option('--interval [value]', 'interval', parseInt)
    .option('--join-timeout [value]', 'join timeout', parseInt)
    .option('--ping-timeout [value]', 'ping timeout', parseInt)
    .option('--ping-req-timeout [value]', 'ping req timeout', parseInt)
    .option('--ping-req-group-size [value]', 'ping req group size', parseInt)
    .option('--max-dgram-size [value]', 'max dgram size', parseInt)
    .parse(process.argv);

    assert(/^(\d+\.\d+\.\d+\.\d+):(\d+)$/.test(program.host));
    assert(Array.isArray(program.hostsToJoin));
}

function handleMessage(swim) {
    var onMessage = function onMessage(message) {
        switch (message.cmd) {
            case 'bootstrap':
                swim.bootstrap(message.hosts, function onBootstrap(err) {
                    if (err) {
                        console.log(err);
                        process.exit(1);
                    }

                    process.send({
                        type: 'checksum',
                        host: swim.localhost(),
                        value: swim.checksum()
                    });
                });
                break;
            case 'join':
                swim.join(message.hosts, function onBootstrap(err) {
                    if (err) {
                        console.log(err);
                        process.exit(1);
                    }

                    process.send({
                        type: 'checksum',
                        host: swim.localhost(),
                        value: swim.checksum()
                    });
                });
                break;
            case 'leave':
                swim.leave();
                break;
            case 'shutdown':
                swim.leave();
                process.removeListener('message', onMessage);
                break;
        }
    };

    process.on('message', onMessage);
}

function bootstrap(callback) {
    var opts = {
        local: {
            host: program.host,
            meta: {
                app: 'benchmark'
            }
        },
        codec: program.codec,
        disseminationFactor: program.disseminationFactor,
        interval: program.interval,
        joinTimeout: program.joinTimeout,
        pingTimeout: program.pingTimeout,
        pingReqTimeout: program.pingReqTimeout,
        pingReqGroupSize: program.pingReqGroupSize,
        udp: {
            maxDgramSize: program.maxDgramSize
        }
    };
    var swim = new Swim(opts);

    swim.on(Swim.EventType.Update, function onUpdate() {
        process.send({
            type: 'checksum',
            host: swim.localhost(),
            value: swim.checksum()
        });
    });

    swim.bootstrap(program.hostsToJoin, function onBootstrap(err) {
        if (err) {
            return callback(err);
        }

        process.send({
            type: 'checksum',
            host: swim.localhost(),
            value: swim.checksum()
        });

        process.send({
            type: 'ready'
        });

        callback(null, swim);
    });
}
