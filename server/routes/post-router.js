const express = require("express");

const PostCtrl = require("../controllers/post-ctrl");

const router = express.Router();

router.post("/post", PostCtrl.createPost);
router.put("/post/:id", PostCtrl.updatePost);
router.delete("/post/:id", PostCtrl.deletePost);
router.get("/posts", PostCtrl.getPosts);
router.get("/post/:id", PostCtrl.getPostById);

module.exports = router;
