const router = require("express").Router();
const Video = require("../models/video");

router.post("/videos", async (req, res) => {
  const newVideo = new Video(req.body);
  newVideo.validateSync();

  if (newVideo.errors) {
    res.status(400);
    res.render("create", { video: newVideo });
  } else {
    await newVideo.save();
    res.redirect(`/videos/${newVideo._id}`);
  }
});

router.get("/videos/create", (req, res) => {
  res.render("create");
});

router.get("/videos", async (req, res) => {
  const videos = await Video.find({});
  res.render("index", { videos });
});

router.get("/videos/:id", async (req, res) => {
  const video = await Video.findById(req.params.id);
  res.render("single-video", { video });
});

module.exports = router;
