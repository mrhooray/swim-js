# API Documentation

## Swim object

### Constructor(options)
See Options Object.

### boostrap(hosts, callback)
Bootstrap swim instance and join cluster.
* hosts - address:port list to connect to when joining the cluster
* callback(err) - callback function

### join(hosts, callback)
Join cluster.
* hosts - address:port list to connect to when joining the cluster
* callback(err) - callback function

### leave()
Leave cluster.

### localhost()
Get host for local node.

### whoami()
Alias to localhost().

### members(hasLocal, hasFaulty)
Get members in the cluster.
* hasLocal - include local node
* hasFaulty - include nodes marked as faulty

### checksum()
Get membership checksum.

## Options Object
This object contains configuration settings.

### local
Local Option.
* local.host (required) - address:port for this instance, e.g. 127.0.0.1:11000
* local.meta (optional) - metadata about this node, which will be desseminated within cluster

### codec
Codec of message payload. Default: msgpack.
* json - https://www.json.org/
* msgpack - https://msgpack.org/

### disseminationFactor
Dissemination factor can be used to fine tune the responsiveness of the cluster.
Greater dissemination factor results to:
* more hosts being notified in every round of dissemination
* lower convergence time of cluster membership
* more/bigger network packets being sent

and vice versa.

### interval
Number of milliseconds between failure detections, also known as the protocol
interval. Every X milliseconds, nodes will ping a member of the SWIM network to
check its liveness with Time-Bounded Strong Completeness as described in the
[paper](http://www.cs.cornell.edu/~asdas/research/dsn02-SWIM.pdf).

### joinTimeout
Number of milliseconds before emitting a JoinTimeout error. The node will still
run as a base node separate from the network.

### pingTimout
Number of milliseconds before sending ping-req messages to the unresponsive node.

### pingReqTimout
Number of milliseconds elapsed from sending ping-req message before marking the
unresponsive node suspicious.

### pingReqGroupSize
Number of hosts to send ping-req messages to for pinging unresponsive nodes
indirectly to reduce false positives.

### suspectTimeout
Number of milliseconds before considering a suspect node faulty.

### udp
UDP Option.
* udp.maxDgramSize - Max size of UDP datagram. If bigger than what the network supports,
messages might be chunked into multiple packets and discarded at receiver end.

### preferCurrentMeta
If set to true, current metadata of local node, instead of the copy of metadata of local node in cluster membership, will be used during conflict resolution. Defaut: false.
