const { assert } = require("chai");

describe("user deleting video", () => {
  describe("deleting video", () => {
    it("removes it from list on landing page", () => {
      browser.url("/videos/create");
      browser.setValue("input#video-title", "video title 123");
      browser.setValue(
        "input#video-url",
        "https://www.youtube.com/embed/WUtVUDzkH9U"
      );
      browser.click("[type=submit]");

      browser.click("#delete");

      browser.url("/");
      assert.notInclude(browser.getText("body"), "video title 123");
    });
  });
});
