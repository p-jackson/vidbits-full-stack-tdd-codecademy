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

describe("Server path: /", () => {
  beforeEach(connectDatabase);
  afterEach(disconnectDatabase);

  describe("GET", () => {
    it("renders existing video", async () => {
      await Video.create({ title: "my title", description: "my desc" });

      const response = await request(app).get("/");

      assert.strictEqual(response.status, 200);
      assert.include(
        parseTextFromHTML(response.text, "#videos-container"),
        "my title"
      );
    });
  });
});
