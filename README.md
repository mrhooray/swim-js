# swim-js [![Build Status](https://travis-ci.org/happner/swim-js.svg?branch=master)](https://travis-ci.org/happner/swim-js)
> JavaScript implementation of [SWIM](http://www.cs.cornell.edu/~asdas/research/dsn02-SWIM.pdf) membership protocol

* [npm](https://www.npmjs.com/package/happn-swim)
* [Motivation](#motivation)
* [Usage](#usage)
* [Benchmark](#benchmark)
* [TODO](#todo)
* [License](#license)

##Motivation
Membership management is important to distributed systems and large clusters need a decentralized protocol such as SWIM,
 which handles failure detection and membership dissemination in a scalable and weakly-consistent way.
It can be used to implement functionalities based on membership like distributed consensus, application layer sharding, log replication, etc.

##Usage
Installation
```sh
npm install happn-swim --save
```
```js
var Swim = require('happn-swim');
var opts = {
    local: {
        // restarting members should resume incarnation sequence (or 0)
        incarnation: previousIncarnation + 1,
        host: '10.31.1.191:11000',
        meta: {'application': 'info'} // optional
    },
    disseminationFactor: 15, // optional
    interval: 100, // optional
    joinTimeout: 200, // optional
    pingTimeout: 20, // optional
    pingReqTimeout: 60, // optional
    pingReqGroupSize: 3, // optional
    udp: {maxDgramSize: 512} // optional
};
var swim = new Swim(opts);
var hostsToJoin = ['10.31.1.192:11000', '10.31.1.193:11000'];

swim.bootstrap(hostsToJoin, function onBootstrap(err) {
    if (err) {
        // error handling
        return;
    }

    // ready
    console.log(swim.whoami());
    console.log(swim.members());
    console.log(swim.checksum());

    // change on membership, e.g. new node or node died/left
    swim.on(Swim.EventType.Change, function onChange(update) {});
    
    // update on membership, e.g. node recovered or update on meta data
    swim.on(Swim.EventType.Update, function onUpdate(update) {
      // if self and incarnation increased, save it (previousIncarnation)
    });

    // shutdown
    swim.leave();
});

// or
swim.bootstrap(hostsToJoin);
// bootstrap error handling
swim.on(Swim.EventType.Error, function onError(err) {});
// bootstrap ready
swim.on(Swim.EventType.Ready, function onReady() {});
```

##Benchmark
Benchmark convergence time under different configuration
```sh
node bench/script/convergence-time.js -h

  Usage: convergence-time [options]

  Options:

    -h, --help                      output usage information
    --cycles [value]                number of cycles
    --workers [value]               number of workers
    --codec [value]                 msgpack or json
    --dissemination-factor [value]  dissemination factor
    --interval [value]              interval
    --join-timeout [value]          join timeout
    --ping-timeout [value]          ping timeout
    --ping-req-timeout [value]      ping req timeout
    --ping-req-group-size [value]   ping req group size
    --max-dgram-size [value]        max dgram size
```
```sh
node bench/script/convergence-time.js

configuration:
- cycles 10
- workers 10
- codec msgpack
- dissemination factor 15
- interval 20 ms
- join timeout 100 ms
- ping timeout 4 ms
- ping req timeout 12 ms
- ping req group size 3
- max dgram size 512 bytes
convergence time under single node failure
histogram data:
- count 10
- min 76
- max 123
- mean 100
- median 101
- variance 308.44444444444446
- std dev 17.56258649642599
- p75 116.25
- p95 123
- p99 123
```

##TODO
- [ ] Documentation for API and events
- [ ] Optional secondary protocol like periodic full sync

##License
MIT
