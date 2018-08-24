const { jsdom } = require("jsdom");
const { mongoose, databaseUrl, options } = require("../database");

async function connectDatabase() {
  await mongoose.connect(
    databaseUrl,
    options
  );

  await mongoose.connection.db.dropDatabase();
}

async function disconnectDatabase() {
  await mongoose.disconnect();
}

const findElement = (htmlAsString, selector) =>
  jsdom(htmlAsString).querySelector(selector);

// extract text from an Element by selector.
const parseTextFromHTML = (htmlAsString, selector) => {
  const selectedElement = findElement(htmlAsString, selector);
  if (selectedElement !== null) {
    return selectedElement.textContent;
  } else {
    throw new Error(
      `No element with selector ${selector} found in HTML string`
    );
  }
};

module.exports = {
  connectDatabase,
  disconnectDatabase,
  findElement,
  parseTextFromHTML
};
