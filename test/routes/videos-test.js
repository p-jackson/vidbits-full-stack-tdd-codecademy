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
        .send({
          title: "title",
          description: "description",
          url: "https://www.youtube.com/embed/Wimkqo8gDZ0"
        });

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
        .send({
          title: "myvideotitle",
          description: "desc123",
          url: "https://www.youtube.com/embed/X6dJEAs0-Gk"
        })
        .redirects(1);

      assert.include(parseTextFromHTML(response.text, "body"), "myvideotitle");
      assert.include(parseTextFromHTML(response.text, "body"), "desc123");
      assert.strictEqual(
        findElement(response.text, "iframe").getAttribute("src"),
        "https://www.youtube.com/embed/X6dJEAs0-Gk"
      );
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

    it("renders validation message when url is missing", async () => {
      const response = await request(app)
        .post("/videos")
        .type("form")
        .send({ title: "custom title" });

      assert.include(
        parseTextFromHTML(response.text, "body"),
        "a URL is required"
      );
    });

    it("fills in the other field values when title is missing", async () => {
      const response = await request(app)
        .post("/videos")
        .type("form")
        .send({
          description: "123",
          url: "https://www.youtube.com/embed/1IkY0_qONRk"
        });

      assert.isEmpty(parseTextFromHTML(response.text, "input#video-title"));
      assert.strictEqual(
        parseTextFromHTML(response.text, "textarea#video-description"),
        "123"
      );
      assert.strictEqual(
        findElement(response.text, "input#video-url").getAttribute("value"),
        "https://www.youtube.com/embed/1IkY0_qONRk"
      );
    });
  });

  describe("GET", () => {
    it("renders existing videos", async () => {
      await Video.create({
        title: "my title",
        description: "my desc",
        url: "https://www.youtube.com/embed/IzIlR5kWU0w"
      });

      const response = await request(app).get("/videos");

      assert.strictEqual(response.status, 200);
      assert.include(
        parseTextFromHTML(response.text, "#videos-container"),
        "my title"
      );
      assert.strictEqual(
        findElement(response.text, "iframe").getAttribute("src"),
        "https://www.youtube.com/embed/IzIlR5kWU0w"
      );
    });
  });

  describe("GET - /videos/:id", () => {
    it("renders the video with that id", async () => {
      const newVideo = await Video.create({
        title: "my title",
        url: "https://www.youtube.com/embed/zgg1xGSGw0s"
      });

      const response = await request(app).get(`/videos/${newVideo._id}`);

      assert.include(parseTextFromHTML(response.text, "body"), "my title");
      assert.strictEqual(
        findElement(response.text, "iframe").getAttribute("src"),
        "https://www.youtube.com/embed/zgg1xGSGw0s"
      );
    });
  });

  describe("GET - /videos/:id/edit", () => {
    it("renders a form for the video", async () => {
      const newVideo = await Video.create({
        title: "my title",
        description: "my desc",
        url: "https://www.youtube.com/embed/NZlfxWMr7nc"
      });

      const response = await request(app).get(`/videos/${newVideo._id}/edit`);

      assert.include(parseTextFromHTML(response.text, "h1"), "my title");
      assert.ok(
        findElement(response.text, "form"),
        "response should contain form"
      );
      assert.strictEqual(
        findElement(response.text, "input#video-title").getAttribute("value"),
        "my title"
      );
      assert.strictEqual(
        findElement(response.text, "input#video-url").getAttribute("value"),
        "https://www.youtube.com/embed/NZlfxWMr7nc"
      );
      assert.strictEqual(
        parseTextFromHTML(response.text, "textarea#video-description"),
        "my desc"
      );
    });
  });

  describe("POST - /videos/:id/updates", () => {
    it("updates the record", async () => {
      const { _id: videoId } = await Video.create({
        title: "original title",
        description: "original desc",
        url: "https://www.youtube.com/embed/NZlfxWMr7nc"
      });

      await request(app)
        .post(`/videos/${videoId}/updates`)
        .type("form")
        .send({
          title: "new title",
          description: "new desc",
          url: "https://www.youtube.com/embed/q2fIWB8o-bs"
        });

      const updatedVideo = await Video.findById(videoId);

      assert.strictEqual(updatedVideo.title, "new title");
      assert.strictEqual(updatedVideo.description, "new desc");
      assert.strictEqual(
        updatedVideo.url,
        "https://www.youtube.com/embed/q2fIWB8o-bs"
      );
    });

    it("redirects to the show video page", async () => {
      const { _id: videoId } = await Video.create({
        title: "original title",
        description: "original desc",
        url: "https://www.youtube.com/embed/NZlfxWMr7nc"
      });

      const response = await request(app)
        .post(`/videos/${videoId}/updates`)
        .type("form")
        .send({
          title: "new title",
          description: "new desc",
          url: "https://www.youtube.com/embed/q2fIWB8o-bs"
        });

      assert.strictEqual(response.status, 302);
      assert.strictEqual(response.header.location, `/videos/${videoId}`);
    });

    it("doesn't update the record when the update request is invalid", async () => {
      const { _id: videoId } = await Video.create({
        title: "original title",
        description: "original desc",
        url: "https://www.youtube.com/embed/NZlfxWMr7nc"
      });

      await request(app)
        .post(`/videos/${videoId}/updates`)
        .type("form")
        .send({
          title: "",
          description: "new desc",
          url: "https://www.youtube.com/embed/NZlfxWMr7nc"
        });

      const updatedVideo = await Video.findById(videoId);

      assert.strictEqual(updatedVideo.title, "original title");
      assert.strictEqual(updatedVideo.description, "original desc");
    });

    it("responds with 400 when the update request is invalid", async () => {
      const { _id: videoId } = await Video.create({
        title: "original title",
        description: "original desc",
        url: "https://www.youtube.com/embed/NZlfxWMr7nc"
      });

      const response = await request(app)
        .post(`/videos/${videoId}/updates`)
        .type("form")
        .send({
          title: "",
          description: "new desc",
          url: "https://www.youtube.com/embed/NZlfxWMr7nc"
        });

      assert.strictEqual(response.status, 400);
    });

    it("shows the original values in edit form when the update request is invalid", async () => {
      const { _id: videoId } = await Video.create({
        title: "original title",
        description: "original desc",
        url: "https://www.youtube.com/embed/NZlfxWMr7nc"
      });

      const response = await request(app)
        .post(`/videos/${videoId}/updates`)
        .type("form")
        .send({
          title: "",
          description: "new desc",
          url: "https://www.youtube.com/embed/NZlfxWMr7nc"
        });

      assert.include(parseTextFromHTML(response.text, "h1"), "original title");
      assert.strictEqual(
        findElement(response.text, "input#video-title").getAttribute("value"),
        "original title"
      );
      assert.strictEqual(
        parseTextFromHTML(response.text, "textarea#video-description"),
        "original desc"
      );
      assert.strictEqual(
        findElement(response.text, "input#video-url").getAttribute("value"),
        "https://www.youtube.com/embed/NZlfxWMr7nc"
      );
    });
  });
});
