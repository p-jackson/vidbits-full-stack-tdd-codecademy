const { assert } = require("chai");

describe("user leaves comment", () => {
  describe("leaving comment on video", () => {
    it("appears on show video page", () => {
      browser.url("/videos/create");
      browser.setValue("input#video-title", "video title 123");
      browser.setValue(
        "input#video-url",
        "https://www.youtube.com/embed/WUtVUDzkH9U"
      );
      browser.click("[type=submit]");

      browser.setValue("textarea#comment-input", "nice vid!");
      browser.click("#comment");

      assert.include(browser.getText("#comments"), "nice vid!");
    });
  });
});
