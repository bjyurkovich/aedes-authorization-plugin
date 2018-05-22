const _ = require("lodash");
const topics = [];
const mqttPattern = require("mqtt-pattern");

let subscriptionTopics = [];
let publishTopics = [];

exports.clearTopics = () => {
  subscriptionTopics = [];
  publishTopics = [];
};

/**
 * Function to be used as plugin to the aedes.instance.authorizeSubscribe
 * See Aedes documentation for more detail
 */
exports.authorizeSubscribe = async (client, sub, callback) => {
  let topic = isSubscriptionTopic(sub.topic);

  if (!topic) {
    return callback({ returnCode: 4 }, null);
  }
  await authorize(client, sub, callback, topic, subscriptionTopics);
};

/**
 * Function to be used as plugin to the aedes.instance.authorizePublish
 * See Aedes documentation for more detail
 */
exports.authorizePublish = async (client, sub, callback) => {
  let topic = isPublishTopic(sub.topic);
  if (!topic) {
    return callback({ returnCode: 4 }, null);
  }
  await authorize(client, sub, callback, topic, publishTopics);
};

/**
 * Adds an expected MQTT topic prototype
 * @param {string} topic expected mqtt topic prototype
 * @param {function(client,sub)} authorizer authoization function to be evaluated upon subscription
 * @param {object} opts isPublishTopic || isSubscriptionTopic - empty object assumes both subscription and publish topic
 */
exports.addTopic = (topic, authorizer, opts) => {
  if (!authorizer) {
    throw Error("No authorization function defined.");
  }

  let out = {
    topic,
    authorizer
  };

  if (!opts || (!opts.isSubscriptionTopic && !opts.isPublishTopic)) {
    subscriptionTopics.push(out);
    publishTopics.push(out);
  }

  if (opts && opts.isSubscriptionTopic) {
    subscriptionTopics.push(out);
  }

  if (opts && opts.isPublishTopic) {
    publishTopics.push(out);
  }

  return;
};

async function authorize(client, sub, callback, pattern, topicList) {
  sub.params = mqttPattern.exec(pattern.topic, sub.topic);

  let auth = await pattern.authorizer(client, sub);

  if (auth) {
    // everything is bene
    callback(null, sub);
  } else {
    // have to do this because of bug in retained Aedes subscription payloads
    return callback({ returnCode: 4 }, null);
  }
}

isSubscriptionTopic = topic => {
  for (let i = 0; i < subscriptionTopics.length; i++) {
    let test = mqttPattern.exec(subscriptionTopics[i].topic, topic);

    if (test) {
      return subscriptionTopics[i];
    }
  }

  return false;
};

isPublishTopic = topic => {
  for (let i = 0; i < publishTopics.length; i++) {
    if (mqttPattern.exec(publishTopics[i].topic, topic)) {
      return publishTopics[i];
    }
  }

  return false;
};
