const { assert } = require("chai");
const { connectDatabase, disconnectDatabase } = require("../test-utilities");
const Video = require("../../models/video");

describe("Model: Video", () => {
  beforeEach(connectDatabase);
  afterEach(disconnectDatabase);

  describe("#title", () => {
    it("is a string", () => {
      const video = new Video({ title: 3 });
      assert.strictEqual(video.title, "3");
    });
  });

  describe("#description", () => {
    it("is a string", () => {
      const video = new Video({ description: 3 });
      assert.strictEqual(video.description, "3");
    });
  });
});
