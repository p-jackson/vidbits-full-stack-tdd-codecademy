const { assert } = require("chai");
const request = require("supertest");
const { jsdom } = require("jsdom");
const {
  connectDatabase,
  disconnectDatabase
} = require("../database-utilities");
const app = require("../../app");
const Video = require("../../models/video");

// extract text from an Element by selector.
const parseTextFromHTML = (htmlAsString, selector) => {
  const selectedElement = jsdom(htmlAsString).querySelector(selector);
  if (selectedElement !== null) {
    return selectedElement.textContent;
  } else {
    throw new Error(
      `No element with selector ${selector} found in HTML string`
    );
  }
};

describe("Server path: /videos", () => {
  beforeEach(connectDatabase);
  afterEach(disconnectDatabase);

  describe("POST", () => {
    it("responds with 201 when a video is created", async () => {
      const response = await request(app)
        .post("/videos")
        .type("form")
        .send({ title: "title", description: "description" });

      assert.strictEqual(response.status, 201);
    });

    it("saves the video to the database", async () => {
      await request(app)
        .post("/videos")
        .type("form")
        .send({ title: "title", description: "description" });

      const savedVideo = await Video.findOne({});

      assert.equal(savedVideo.title, "title");
      assert.equal(savedVideo.description, "description");
    });

    it("renders the newly created video", async () => {
      const response = await request(app)
        .post("/videos")
        .type("form")
        .send({ title: "myvideotitle", description: "desc123" });

      assert.include(parseTextFromHTML(response.text, "body"), "myvideotitle");
      assert.include(parseTextFromHTML(response.text, "body"), "desc123");
    });
  });
});
