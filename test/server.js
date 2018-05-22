const aedes = require("aedes")({
  persistence: new require("aedes-persistence")()
});
const server = require("net").createServer(aedes.handle);
const port = 1981;
const { authorizePublish, authorizeSubscribe, addTopic } = require("../");

const {
  allowUserBySpecialId,
  allowEventDetails
} = require("../example/topicAuthorizers");

addTopic("users/+userId", allowUserBySpecialId);
addTopic("users/+userId/events/+eventId", allowEventDetails);

aedes.authorizeSubscribe = authorizeSubscribe;
aedes.authorizePublish = authorizePublish;

server.listen(port, function() {
  console.log("server listening on port", port);
});
