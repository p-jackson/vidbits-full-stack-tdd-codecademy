const { assert } = require("chai");
const { URL } = require("url");

describe("user creates videos", () => {
  describe("submitting video form", () => {
    it("displays the created video on the landing page", () => {
      browser.url("/videos/create");

      browser.setValue("input#video-title", "vid title");
      browser.setValue(
        "input#video-url",
        "https://www.youtube.com/embed/zlfgLXqvx_M"
      );
      browser.setValue("textarea#video-description", "description");
      browser.click('[type="submit"]');

      assert.include(browser.getText("body"), "vid title");
      assert.include(browser.getText("body"), "description");
      assert.include(
        browser.getAttribute("iframe", "src"),
        "https://www.youtube.com/embed/zlfgLXqvx_M"
      );
    });

    it("does a POST to /videos", () => {
      browser.url("/videos/create");

      const actionUrl = new URL(browser.getAttribute("form", "action"));

      assert.strictEqual(browser.getAttribute("form", "method"), "post");
      assert.strictEqual(actionUrl.pathname, "/videos");
    });
  });
});
