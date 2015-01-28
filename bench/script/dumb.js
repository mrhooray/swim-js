#!/usr/bin/env node
'use strict';
var Swim = require('../../lib/swim');

var hosts = [
    '127.0.0.1:11111',
    '127.0.0.1:22222',
    '127.0.0.1:33333'
];
var swim0 = new Swim({
    local: {
        host: hosts[0],
        meta: {
            node: 1
        }
    }
});

var swim1 = new Swim({
    local: {
        host: hosts[1],
        meta: {
            node: 2
        }
    }
});

var swim2 = new Swim({
    local: {
        host: hosts[2],
        meta: {
            node: 3
        }
    }
});

swim0.bootstrap([], function onBootstrap(err) {
    console.log('swim0 bootstrap error', err);
    swim1.bootstrap(hosts, function onBootstrap(err) {
        console.log('swim1 bootstrap error', err);
    });
    swim2.bootstrap(hosts, function onBootstrap(err) {
        console.log('swim2 bootstrap error', err);
    });
});

setInterval(function print() {
    console.log('-------------------------------');
    console.log(swim0.localhost(), swim0.members());
    console.log(swim1.localhost(), swim1.members());
    console.log(swim2.localhost(), swim2.members());
}, 1000);

setTimeout(function leave() {
    console.log('swim0 leaves');
    swim0.leave();
}, 1000 * 5);

setTimeout(function rejoin() {
    console.log('swim0 rejoins');
    swim0.bootstrap(hosts, function onBootstrap(err) {
        console.log('swim0 bootstrap error', err);
    });
}, 1000 * 15);

setTimeout(function leave() {
    console.log('swim0 leaves');
    swim0.leave();
}, 1000 * 20);

setTimeout(function rejoin() {
    console.log('swim0 rejoins');
    swim0.bootstrap(hosts, function onBootstrap(err) {
        console.log('swim0 bootstrap error', err);
    });
}, 1000 * 23);
