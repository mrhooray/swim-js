'use strict';

module.exports = function singleNodeFailure(context, callback) {
    var hosts = Object.keys(context.hostToAliveWorker);
    var host = hosts[Math.floor(Math.random() * hosts.length)];

    if (host) {
        context.hostToFaultyWorker[host] = context.hostToAliveWorker[host];
        delete context.hostToAliveWorker[host];
        context.hostToFaultyWorker[host].send({
            cmd: 'leave'
        });
    }

    process.nextTick(callback);
};
