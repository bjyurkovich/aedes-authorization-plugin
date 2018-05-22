exports.allowUserBySpecialId = (client, sub) => {
  if (sub.params.userId === "1") {
    return true;
  } else {
    return false;
  }
};

exports.allowEventDetails = (client, sub) => {
  if (sub.params.eventId === "1") {
    return new Promise(r =>
      setTimeout(() => {
        r(true);
      }, 3000)
    );
  } else {
    return new Promise(r =>
      setTimeout(() => {
        r(false);
      }, 3000)
    );
  }
};
