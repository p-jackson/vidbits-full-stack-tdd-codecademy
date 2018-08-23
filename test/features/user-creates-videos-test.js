const { assert } = require("chai");
const { URL } = require("url");

describe("user creates videos", () => {
  describe("submitting video form", () => {
    it("displays the created video on the landing page", () => {
      browser.url("/videos/create");

      browser.setValue("input#video-title", "vid title");
      browser.setValue("textarea#video-description", "description");
      browser.click('[type="submit"]');

      assert.include(browser.getText("body"), "vid title");
      assert.include(browser.getText("body"), "description");
    });

    it("does a POST to /videos", () => {
      browser.url("/videos/create");

      const actionUrl = new URL(browser.getAttribute("form", "action"));

      assert.strictEqual(browser.getAttribute("form", "method"), "post");
      assert.strictEqual(actionUrl.pathname, "/videos");
    });
  });
});
