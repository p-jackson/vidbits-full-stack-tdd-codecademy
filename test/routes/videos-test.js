const { assert } = require("chai");
const { jsdom } = require("jsdom");
const request = require("supertest");
const {
  connectDatabase,
  disconnectDatabase,
  parseTextFromHTML,
  findElement
} = require("../test-utilities");
const app = require("../../app");
const Video = require("../../models/video");

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

    it("doesn't save video when title is missing", async () => {
      await request(app)
        .post("/videos")
        .type("form")
        .send({ description: "desc123" });

      const video = await Video.find({});
      assert.isEmpty(video);
    });

    it("responds with 400 if title is missing", async () => {
      const response = await request(app)
        .post("/videos")
        .type("form")
        .send({ description: "description" });

      assert.strictEqual(response.status, 400);
    });

    it("shows the video form if title is missing", async () => {
      const response = await request(app)
        .post("/videos")
        .type("form")
        .send({ description: "description" });

      assert.exists(
        findElement(response.text, 'form[action="/videos"]'),
        "video form should exist"
      );
      assert.exists(
        findElement(response.text, "input#video-title"),
        "video title field should exist"
      );
      assert.exists(
        findElement(response.text, "textarea#video-description"),
        "video description field should exist"
      );
    });

    it("renders validation message when title is missing", async () => {
      const response = await request(app)
        .post("/videos")
        .type("form")
        .send({});

      assert.include(parseTextFromHTML(response.text, "body"), "required");
    });

    it("fills in the other field values when title is missing", async () => {
      const response = await request(app)
        .post("/videos")
        .type("form")
        .send({ description: "123" });

      assert.isEmpty(parseTextFromHTML(response.text, "input#video-title"));
      assert.strictEqual(
        parseTextFromHTML(response.text, "textarea#video-description"),
        "123"
      );
    });
  });
});
