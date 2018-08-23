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
});
