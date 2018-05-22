# aedes-authorization-plugin&nbsp;&nbsp;[![Build Status](https://travis-ci.org/bjyurkovich/aedes-authorization-plugin.svg)](bjyurkovich/aedes-authorization-plugin)

A semi-opinionated authorizer for [aedes](https://github.com/mcollina/aedes) MQTT broker loosely inspired by expressjs.

> Note: This library is written in ES6, so be careful when mixing with `aedes`!!

## Install

```bash
npm i -S aedes-authorization-plugin
```

## Example

```javascript
const aedes = require("aedes")({
  persistence: new require("aedes-persistence")()
});
const database = new require("../db")();
const server = require("net").createServer(aedes.handle);
const port = 1883;
const {
  authorizePublish,
  authorizeSubscribe,
  addTopic
} = require("aedes-authorization-plugin");

// add topics and authorizer functionality (promises supported, too)
addTopic("users/+userId", (client, sub) => {
  if (sub.params.userId === "12345") {
    return true; // allowed!
  } else {
    return false; // not allowed!
  }
});

addTopic("users/+userId/events/+eventId", async (client, { params }) => {
  let id = await database.query(
    "SELECT event FROM EVENT WHERE id=?",
    params.eventId
  );

  if (id) {
    return true;
  } else {
    return false;
  }
});

addTopic(
  "users/+userId/profiles/+profileId",
  (client, { params }) => {
    if (params.profileId === "myProfileId") {
      return true;
    }

    return false;
  },
  { isSubscriptionTopic: true }
); // only apply to subscription topics

// hook it up
aedes.authorizeSubscribe = authorizeSubscribe;
aedes.authorizePublish = authorizePublish;

server.listen(port, function() {
  console.log("server listening on port", port);
});
```

## API

#### authorizePublish ( client, sub, callback )

`aedes` publish authorizer handle. Once set, clients can only publish to topics that have been added via `addTopic`.

#### authorizeSubscribe ( client, sub, callback )

`aedes` subscribe authorizer handle. Once set, clients can only subscribe to topics that have been added via `addTopic`. Should return `true` or `false` depending on desired auth pattern.

#### addTopic ( topic, authorizer, [...opts] )

Add a topic for validation. `topic` is specified according to the MQTT spec. A good guide on this can be found [here](http://www.steves-internet-guide.com/understanding-mqtt-topics/).

_`authorizer`_ is a function of the form

```javascript
function (client, sub){
	//sub.params holds the topic params
	return true
}
```

where `sub` has the property `params` which holds the mapped `+` values from subscribed/published topic.

_`opts`_ takes the object form `{isSubscriptionTopic: true, isPublishTopic: false}`. If no `opts` is given, `authorizer` will be run on both subscriptions and publications. If only `isSubscriptionTopic` or `isPublishTopic` is specified, then the other will not be included in the running of `authorizer` for that topic.

#### clearTopics ()

Clears all the topics that were added via `addTopic`.

## Testing

Pull requests accepted.

```
npm install -D
npm test
```

There is also an `aedes` server written for full integration testing in `test/server.js`.

## License

MIT licensed, so have your way with it.
