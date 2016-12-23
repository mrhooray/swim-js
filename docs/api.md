# API Documentation

# Swim object

## methods
* constructor(options) - See Options Object.
* boostrap(hostsToJoin, onBootStrapFunction) -
- hostsToJoin - Addresses (with port) to try to connect to when joining the network.
- onBootStrapFunction(err) - handler
* whoami() - node identifier
* members(hasLocal, hasFaulty) - gets a list of nodes in the network.
hasLocal - nodes locally connected to this node.
hasFaulty - nodes that are labeled suspect.
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

##disseminationFactor
When a node encounters an unresponsive node, it will mark that node "suspicious",
if enough nodes mark the node as suspect, then the node is dropped form the
network.

##interval
Number of milliseconds between failure detection intervals.  Every X
milliseconds, nodes will ping a member of the SWIM network to check if its peer
is still running/responding.

##joinTimeout
Number of milliseconds before emitting a JoinTimeout error.  The node will still
run as a base node separate from the network.

##pingTimout
Average ping response time threshold, in milliseconds, for suspicion.

##pingReqTimout
Any ping response time above this threshold, in milliseconds, will mark this
node suspicious

##pingReqGroupSize
Number of pings to use to get average response time.

##udp
UDP Options
* maxDgramSize - max size of UDP datagram before sending.
