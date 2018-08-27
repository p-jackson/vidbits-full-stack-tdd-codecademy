const router = require("express").Router();
const Video = require("../models/video");

router.post("/videos", async (req, res) => {
  const { title, description, url } = req.body;

  const newVideo = new Video({ title, description, url });
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

router.get("/videos/:id/edit", async (req, res) => {
  const video = await Video.findById(req.params.id);
  res.render("edit-video", { video });
});

router.post("/videos/:id/updates", async (req, res) => {
  const video = await Video.findById(req.params.id);

  const { title: oldTitle, url: oldUrl, description: oldDescription } = video;

  const {
    title: newTitle,
    url: newUrl,
    description: newDescription
  } = req.body;
  video.title = newTitle;
  video.url = newUrl;
  video.description = newDescription;

  video.validateSync();

  if (video.errors) {
    res.status(400);
    res.render("edit-video", {
      video: {
        title: oldTitle,
        url: oldUrl,
        description: oldDescription
      }
    });
  } else {
    await video.save();
    res.redirect(`/videos/${req.params.id}`);
  }
});

module.exports = router;
