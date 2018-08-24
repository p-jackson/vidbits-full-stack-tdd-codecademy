const { assert } = require("chai");
const request = require("supertest");
const {
  connectDatabase,
  disconnectDatabase,
  parseTextFromHTML
} = require("../test-utilities");
const app = require("../../app");
const Video = require("../../models/video");

describe("Server path: /", () => {
  beforeEach(connectDatabase);
  afterEach(disconnectDatabase);

  describe("GET", () => {
    it("renders existing video", async () => {
      await Video.create({ title: "my title", description: "my desc" });

      const response = await request(app)
        .get("/")
        .redirects(1);

      assert.strictEqual(response.status, 200);
      assert.include(
        parseTextFromHTML(response.text, "#videos-container"),
        "my title"
      );
    });
  });
});
