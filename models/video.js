const { mongoose } = require("../database");

const Video = mongoose.model(
  "Video",
  mongoose.Schema({
    title: { type: String },
    description: { type: String }
  })
);

module.exports = Video;
