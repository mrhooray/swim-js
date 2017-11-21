# API Documentation

# Swim object

## methods
* constructor(options) - See Options Object.
* boostrap(hostsToJoin, onBootStrapFunction) -
- hostsToJoin - Addresses (with port) to try to connect to when joining the network.
- onBootStrapFunction(err) - handler
* whoami() - node identifier
* members(hasLocal, hasFaulty) - gets a list of nodes in the network.
hasLocal - include local/current node.
hasFaulty - include nodes marked as faulty.
* checksum() - ???

##

# Options Object
This object contains configuration settings.

## local
* local.host (required) - address and port for this instance.  ex: localhost:11000, the
address portion of the host entry will be used as an identifier for this node,
while the port number portion will be the port this node will listen to for
new connections.
* local.meta (optional) - Additional information to add meta data about this node.  This
will be associated with the node identification when sending messages.

## codec
encoding to send payloads.  Default msgpack.
* json - encodes message sent between nodes as raw json.
* msgpack - Uses msgpack, http://msgpack.org/, encoding to reduce number of
bytes sent by the payload.

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
Number of milliseconds before emitting a JoinTimeout error.  The node will still
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
Number of milliseconds before considering a suspect node faulty

### udp
UDP Options
* maxDgramSize - Max size of UDP datagram. If bigger than what the network supports,
messages might be chunked into multiple packets and discarded at receiver end.
