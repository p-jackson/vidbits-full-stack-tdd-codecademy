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

router.post("/videos/:id/deletions", async (req, res) => {
  const video = await Video.findById(req.params.id);
  await video.remove();
  res.redirect("/");
});

router.post("/videos/:id/comments", async (req, res) => {
  const { value } = req.body;
  await prependComment(req.params.id, value);
  res.redirect(`/videos/${req.params.id}`);
});

function prependComment(videoId, comment) {
  return new Promise((resolve, reject) => {
    Video.findByIdAndUpdate(
      videoId,
      { $push: { comments: { $each: [comment], $position: 0 } } },
      { new: true },
      (err, model) => {
        if (err) reject(err);
        else resolve(model);
      }
    );
  });
}

module.exports = router;
