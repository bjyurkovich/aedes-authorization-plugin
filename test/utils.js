const mqtt = require("mqtt");

exports.publishAsync = function({
  url,
  topic = "/",
  message = {},
  retain = true,
  username,
  password
}) {
  return new Promise((resolve, reject) => {
    const client = mqtt.connect("mqtt://" + url, {
      username,
      password,
      clientId: topic.split("/").join("-") + "-" + username
    });
    client.on("error", err => {
      client.end(true);
      return reject({ err, status: 401 });
    });
    client.on("reconnect", () => {
      client.end(true);
      return reject({ err: "reconnect", status: 401 });
    });
    client.on("connect", () => {
      client.publish(
        topic,
        JSON.stringify(message),
        { retain, qos: 1 },
        (err, granted) => {
          if (err) {
            reject(err);
          }
          client.end(true);
          resolve(granted);
        }
      );
    });
  });
};

exports.subscribeAsync = function({
  url,
  topic = "/",
  username,
  password,
  onMessage,
  onSubscribe,
  endOnSubscribe = false
}) {
  return new Promise((resolve, reject) => {
    const client = mqtt.connect("mqtt://" + url, {
      username,
      password,
      clientId: topic.split("/").join("-") + "-" + username
    });
    client.on("error", err => {
      client.end(true);
      return reject({ err, status: 401 });
    });
    client.on("connect", () => {
      client.subscribe(topic, { qos: 1 }, (err, granted) => {
        if (err) {
          client.end(true);
          return reject(err);
        }
        onSubscribe(granted);
        if (endOnSubscribe) {
          client.end(true);
          resolve(true);
        }
      });
    });
    client.on("reconnect", () => {
      client.end(true);
      return resolve({ err: "reconnect", status: 401 });
    });
    client.on("message", (topic, message) => {
      onMessage(topic, message);
      resolve(JSON.parse(message.toString()));
      client.end(true);
    });
  });
};
