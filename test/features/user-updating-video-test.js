const { assert } = require("chai");

describe("user updating video", () => {
  describe("updating video", () => {
    it("changes the values", () => {
      browser.url("/videos/create");
      browser.setValue("input#video-title", "title 113");
      browser.setValue(
        "input#video-url",
        "https://www.youtube.com/embed/jz_QaSnlN6Q"
      );
      browser.setValue("textarea#video-description", "desc 226");
      browser.click("[type=submit]");

      browser.click("#edit");

      browser.setValue("input#video-title", "changed title");
      browser.click("[type=submit]");

      assert.include(browser.getText("body"), "changed title");
    });

    it("does not create an additional video", () => {
      browser.url("/videos/create");
      browser.setValue("input#video-title", "original title");
      browser.setValue(
        "input#video-url",
        "https://www.youtube.com/embed/jz_QaSnlN6Q"
      );
      browser.click("[type=submit]");

      browser.click("#edit");

      browser.setValue("input#video-title", "changed title");
      browser.click("[type=submit]");

      browser.url("/");

      assert.notInclude(browser.getText("body"), "original title");
    });
  });
});
