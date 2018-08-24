const { assert } = require("chai");

describe("user vists landing page", () => {
  describe("with no existing videos", () => {
    it("video container empty", () => {
      browser.url("/");

      assert.strictEqual(browser.getText("#videos-container"), "");
    });

    it("can navigate to video creation page", () => {
      browser.url("/");

      browser.click('a[href$="videos/create"]');

      assert.include(browser.getText("body"), "Save a video");
    });
  });

  describe("with an existing video", () => {
    it("renders it in the list", async () => {
      browser.url("/videos/create");
      browser.setValue("input#video-title", "title1");
      browser.setValue(
        "input#video-url",
        "https://www.youtube.com/embed/IzIlR5kWU0w"
      );
      browser.click("[type=submit]");

      browser.url("/");
      assert.include(browser.getText("#videos-container"), "title1");
      assert.strictEqual(
        browser.getAttribute("iframe", "src"),
        "https://www.youtube.com/embed/IzIlR5kWU0w"
      );
    });
  });
});
