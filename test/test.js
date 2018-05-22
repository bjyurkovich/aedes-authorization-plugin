const expect = require("chai").expect;
const { subscribeAsync, publishAsync } = require("../");
const {
  authorizeSubscribe,
  authorizePublish,
  addTopic,
  clearTopics
} = require("../");

describe("Aedes Authorizer Tests", function(done) {
  this.timeout(5000);

  it("should import functions", async () => {
    expect(authorizeSubscribe).to.not.equal(null);
    expect(authorizePublish).to.not.equal(null);
    expect(addTopic).to.not.equal(null);
  });

  it("should add a well formed topic and evaluate a subscription as authorized", async () => {
    clearTopics();
    addTopic("users/+userId", (client, { params }) => {
      if (params.userId === "aGoodId") {
        return true;
      }
      return false;
    });

    return await authorizeSubscribe({}, { topic: "users/aGoodId" }, (a, b) => {
      expect(a).to.equal(null);
      expect(b.topic).to.equal("users/aGoodId");
    });
  });

  it("should add a well formed topic and evaluate a publication as authorized", async () => {
    clearTopics();
    addTopic("users/+userId", (client, { params }) => {
      if (params.userId === "aGoodId") {
        return true;
      }
      return false;
    });

    return await authorizePublish({}, { topic: "users/aGoodId" }, (a, b) => {
      expect(a).to.equal(null);
      expect(b.topic).to.equal("users/aGoodId");
    });
  });

  it("should add a well formed topic and evaluate a subscription as unauthorized", async () => {
    clearTopics();
    addTopic("users/+userId", (client, { params }) => {
      if (params.userId === "aGoodId") {
        return true;
      }
      return false;
    });

    return await authorizeSubscribe(
      {},
      { topic: "users/notAGoodId" },
      (a, b) => {
        expect(a.returnCode).to.equal(4);
        expect(b).to.equal(null);
      }
    );
  });

  it("should evaluate a subscription as unauthorized with no topics defined", async () => {
    clearTopics();
    return await authorizeSubscribe(
      {},
      { topic: "users/notAGoodId" },
      (a, b) => {
        expect(a).to.have.property("returnCode");
        expect(b).to.be.null;
      }
    );
  });

  it("should evaluate a publication as unauthorized with no topics defined", async () => {
    clearTopics();
    return await authorizeSubscribe(
      {},
      { topic: "users/notAGoodId" },
      (a, b) => {
        expect(a).to.have.property("returnCode");
        expect(b).to.be.null;
      }
    );
  });

  it("should add a well formed topic as subscription only and evaluate a subscription as authorized", async () => {
    clearTopics();
    addTopic(
      "users/+userId",
      (client, { params }) => {
        if (params.userId === "aGoodId") {
          return true;
        }
        return false;
      },
      { isSubscriptionTopic: true }
    );

    await authorizeSubscribe({}, { topic: "users/aGoodId" }, (a, b) => {
      expect(a).to.equal(null);
      expect(b.topic).to.equal("users/aGoodId");
    });

    return await authorizePublish({}, { topic: "users/aGoodId" }, (a, b) => {
      expect(a).to.have.property("returnCode");
      expect(b).to.equal(null);
    });
  });

  it("should add a poorly formed topic and evaluate a publication as authorized", async () => {
    clearTopics();
    addTopic("/users/+userId", (client, { params }) => {
      if (params.userId === "aGoodId") {
        return true;
      }
      return false;
    });

    return await authorizePublish({}, { topic: "/users/aGoodId" }, (a, b) => {
      expect(a).to.equal(null);
      expect(b.topic).to.equal("/users/aGoodId");
    });
  });

  it("should add a poorly formed topic and evaluate a publication as unauthorized", async () => {
    clearTopics();
    addTopic("/users/+userId", (client, { params }) => {
      if (params.userId === "aGoodId") {
        return true;
      }
      return false;
    });

    await authorizePublish({}, { topic: "users/aGoodId" }, (a, b) => {
      expect(a).to.have.property("returnCode");
      expect(b).to.equal(null);
    });

    return await authorizePublish({}, { topic: "/users/AGoodId" }, (a, b) => {
      expect(a).to.have.property("returnCode");
      expect(b).to.equal(null);
    });
  });

  it("should add a case sensitive topic param and evaluate a publication as unauthorized", async () => {
    clearTopics();
    addTopic("users/+UserId", (client, { params }) => {
      if (params.UserId === "aGoodId") {
        return true;
      }
      return false;
    });

    return await authorizePublish({}, { topic: "users/AGoodId" }, (a, b) => {
      expect(a).to.have.property("returnCode");
      expect(b).to.equal(null);
    });
  });

  it("should add a case sensitive topic param and evaluate a publication as authorized", async () => {
    clearTopics();
    addTopic("users/+UserId", (client, { params }) => {
      if (params.UserId === "aGoodId") {
        return true;
      }
      return false;
    });

    return await authorizePublish({}, { topic: "users/aGoodId" }, (a, b) => {
      expect(a).to.equal(null);
      expect(b.topic).to.equal("users/aGoodId");
    });
  });

  it("should add a case sensitive topic param and evaluate a publication as authorized", async () => {
    clearTopics();
    addTopic("users/+UserId", (client, { params }) => {
      if (params.userId === "aGoodId") {
        return true;
      }
      return false;
    });

    return await authorizePublish({}, { topic: "users/AGoodId" }, (a, b) => {
      expect(a).to.have.property("returnCode");
      expect(b).to.equal(null);
    });
  });

  it("should disallow a poorly formed topic", async () => {
    clearTopics();
    addTopic("users//+userId", (client, { params }) => {
      if (params.userId === "aGoodId") {
        return true;
      }
      return false;
    });

    return await authorizePublish({}, { topic: "users/aGoodId" }, (a, b) => {
      expect(a).to.have.property("returnCode");
      expect(b).to.equal(null);
    });
  });

  it("should disallow a poorly formed topic", async () => {
    clearTopics();
    addTopic("users/+userId", (client, { params }) => {
      if (params.userId === "aGoodId") {
        return true;
      }
      return false;
    });

    return await authorizePublish({}, { topic: "users//aGoodId" }, (a, b) => {
      expect(a).to.have.property("returnCode");
      expect(b).to.equal(null);
    });
  });

  it("should allow a multiple parameter topic", async () => {
    clearTopics();
    addTopic(
      "users/+userId/profiles/+profileId/posts/+postId/events/+eventId",
      (client, { params }) => {
        if (params.userId === "aGoodId" && params.eventId === "2") {
          return true;
        }
        return false;
      }
    );

    return await authorizeSubscribe(
      {},
      { topic: "users/aGoodId/profiles/2AAFF/posts/adfadf/events/2" },
      (a, b) => {
        expect(a).to.equal(null);
        expect(b.topic).to.equal(
          "users/aGoodId/profiles/2AAFF/posts/adfadf/events/2"
        );
      }
    );
  });

  it("should allow a trailing slash with matched trailing slash", async () => {
    clearTopics();
    addTopic("users/+userId/", (client, { params }) => {
      if (params.userId === "aGoodId") {
        return true;
      }
      return false;
    });

    return await authorizePublish({}, { topic: "users/aGoodId/" }, (a, b) => {
      expect(a).to.equal(null);
      expect(b.topic).to.equal("users/aGoodId/");
    });
  });

  it("should disallow a trailing slash with no trailing slash", async () => {
    clearTopics();
    addTopic("users/+userId/", (client, { params }) => {
      if (params.userId === "aGoodId") {
        return true;
      }
      return false;
    });

    return await authorizePublish({}, { topic: "users/aGoodId" }, (a, b) => {
      expect(a).to.have.property("returnCode");
      expect(b).to.equal(null);
    });
  });

  it("should add multiple similar topics", async () => {
    clearTopics();
    addTopic("users/+userId", (client, { params }) => {
      if (params.userId === "aGoodId") {
        return true;
      }
      return false;
    });

    addTopic("users/+userId/profiles/+profileId", (client, { params }) => {
      if (params.userId === "aGoodId" && params.profileId === "2") {
        return true;
      }
      return false;
    });

    await authorizePublish({}, { topic: "users/aGoodId" }, (a, b) => {
      expect(a).to.equal(null);
      expect(b.topic).to.equal("users/aGoodId");
    });

    await authorizeSubscribe({}, { topic: "users/aGoodId" }, (a, b) => {
      expect(a).to.equal(null);
      expect(b.topic).to.equal("users/aGoodId");
    });

    await authorizePublish(
      {},
      { topic: "users/aGoodId/profiles/2" },
      (a, b) => {
        expect(a).to.equal(null);
        expect(b.topic).to.equal("users/aGoodId/profiles/2");
      }
    );

    return await authorizeSubscribe(
      {},
      { topic: "users/aGoodId/profiles/2" },
      (a, b) => {
        expect(a).to.equal(null);
        expect(b.topic).to.equal("users/aGoodId/profiles/2");
      }
    );
  });

  it("should disallow a non specified param", async () => {
    clearTopics();
    addTopic("users/+userId", (client, { params }) => {
      if (params.userId === "aGoodId") {
        return true;
      }
      return false;
    });

    return await authorizePublish({}, { topic: "users/" }, (a, b) => {
      expect(a).to.have.property("returnCode");
      expect(b).to.equal(null);
    });
  });

  it("should not fail on a param with special characters", async () => {
    clearTopics();
    addTopic("users/+userId/profiles/+profileId", (client, { params }) => {
      if (params.userId === "aGoodId") {
        return true;
      }
      return false;
    });

    return await authorizeSubscribe(
      {},
      { topic: "users/this is .a b$ad param%*(&*/profiles/1" },
      (a, b) => {
        expect(a).to.have.property("returnCode");
        expect(b).to.equal(null);
      }
    );
  });

  it("should allow weird param with characters", async () => {
    clearTopics();
    addTopic("users/+userId/profiles/+profileId", (client, { params }) => {
      if (params.userId === "this is .a b$ad param%*(&*") {
        return true;
      }
      return false;
    });

    return await authorizeSubscribe(
      {},
      { topic: "users/this is .a b$ad param%*(&*/profiles/1" },
      (a, b) => {
        expect(a).to.equal(null);
        expect(b.topic).to.equal("users/this is .a b$ad param%*(&*/profiles/1");
      }
    );
  });
});
