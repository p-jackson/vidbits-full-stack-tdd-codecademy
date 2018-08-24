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

    it("is required", () => {
      const video = new Video({});
      video.validateSync();

      assert.isOk(video.errors, "video model should contain errors");
    });
  });

  describe("#description", () => {
    it("is a string", () => {
      const video = new Video({ description: 3 });
      assert.strictEqual(video.description, "3");
    });
  });

  describe("#url", () => {
    it("is a string", () => {
      const video = new Video({ url: 18 });
      assert.strictEqual(video.url, "18");
    });
  });
});
