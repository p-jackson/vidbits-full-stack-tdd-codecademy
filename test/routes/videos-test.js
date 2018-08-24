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

      assert.strictEqual(response.status, 302);
      assert.match(response.header.location, /^\/videos\/[a-z0-9]+$/);
    });

    it("saves the video to the database", async () => {
      await request(app)
        .post("/videos")
        .type("form")
        .send({
          title: "title",
          description: "description",
          url: "https://www.youtube.com/embed/Vj-c9wA6No4"
        });

      const savedVideo = await Video.findOne({});

      assert.include(savedVideo, {
        title: "title",
        description: "description",
        url: "https://www.youtube.com/embed/Vj-c9wA6No4"
      });
    });

    it("renders the newly created video", async () => {
      const response = await request(app)
        .post("/videos")
        .type("form")
        .send({ title: "myvideotitle", description: "desc123" })
        .redirects(1);

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

  describe("GET - /videos/:id", () => {
    it("renders the video with that id", async () => {
      const newVideo = await Video.create({ title: "my title" });

      const response = await request(app).get(`/videos/${newVideo._id}`);

      assert.include(parseTextFromHTML(response.text, "body"), "my title");
    });
  });
});
