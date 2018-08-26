const { assert } = require("chai");

const generateRandomUrl = domain => {
  return `http://${domain}/${Math.random()}`;
};

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
      const videoUrl = generateRandomUrl("example.com");

      browser.url("/videos/create");
      browser.setValue("input#video-title", "title1");
      browser.setValue("input#video-url", videoUrl);
      browser.click("[type=submit]");

      browser.url("/");
      assert.include(browser.getText("#videos-container"), "title1");
      assert.strictEqual(browser.getAttribute("iframe", "src"), videoUrl);
    });

    it("can navigate to a video", async () => {
      const videoUrl = generateRandomUrl("example.com");

      browser.url("/videos/create");
      browser.setValue("input#video-title", "title1");
      browser.setValue("input#video-url", videoUrl);
      browser.click("[type=submit]");

      browser.url("/");
      browser.click(".video-card a");

      assert.include(browser.getText("body"), "title1");
      assert.strictEqual(browser.getAttribute("iframe", "src"), videoUrl);
    });
  });
});
