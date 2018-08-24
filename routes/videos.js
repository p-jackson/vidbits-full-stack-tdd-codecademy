const router = require("express").Router();
const Video = require("../models/video");

router.post("/videos", async (req, res) => {
  const newVideo = new Video(req.body);

  await newVideo.save();

  res.status(201);
  res.render("single-video", { video: newVideo });
});

router.get("/videos/create", (req, res) => {
  res.render("create");
});

router.get("/", async (req, res) => {
  const videos = await Video.find({});
  res.render("index", { videos });
});

module.exports = router;
