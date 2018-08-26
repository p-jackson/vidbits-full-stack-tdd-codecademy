const { assert } = require("chai");
const request = require("supertest");
const app = require("../../app");

describe("Server path: /", () => {
  describe("GET", () => {
    it("redirects to /video page", async () => {
      const response = await request(app).get("/");

      assert.strictEqual(response.status, 302);
      assert.strictEqual(response.header.location, "/videos");
    });
  });
});
