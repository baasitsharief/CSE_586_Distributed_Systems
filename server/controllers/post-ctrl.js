const Post = require("../models/post-model");

createPost = (req, res) => {
  const body = req.body;

  req.header("Content-Type", "application/json");

  if (!body) {
    return res.status(400).json({
      status: false,
      error: "Post details are empty",
    });
  }

  const post = new Post(body);

  if (!post) {
    return res.status(400).json({
      status: false,
      error: "Incompatible format",
    });
  }

  post
    .save()
    .then(() => {
      return res.status(201).json({
        status: true,
        id: post._id,
        message: "Post created!",
      });
    })
    .catch((error) => {
      return res.status(400).json({
        error,
        message: "Post not created",
      });
    });
};

updatePost = async (req, res) => {
  const body = req.body;

  if (!body) {
    return res.status(400).json({
      status: false,
      error: "No body provided",
    });
  }

  Post.findOne({ _id: req.params.id }, (err, post) => {
    //can use findbyidandupdate()
    if (err) {
      return res.status(404).json({
        err,
        message: "Post not found!",
      });
    }
    post.title = body.title;
    post.author = body.author;
    post.description = body.description;

    post
      .save()
      .then(() => {
        return res.status(200).json({
          status: true,
          id: post._id,
          message: "Post updated",
        });
      })
      .catch((error) => {
        return res.status(404).json({
          error,
          message: "Post not updated!",
        });
      });
  })
    .clone()
    .catch((error) => {
      return res.status(404).json({
        error,
        message: "Post not updated!",
      });
    });
};

deletePost = async (req, res) => {
  return await Post.findOneAndDelete({ _id: req.params.id }, (err, post) => {
    console.log(post);
    if (err) {
      return res.status(400).json({
        status: false,
        error: err,
      });
    }

    if (!post) {
      return res.status(404).json({
        status: false,
        error: "Post not found",
      });
    }

    return res.status(200).json({ status: true, data: post });
  }).catch((err) => console.log(err));
};

getPosts = async (req, res) => {
  return await Post.find({}, (err, posts) => {
    if (err) {
      return res.status(400).json({
        status: false,
        error: err,
      });
    }

    if (!posts.length) {
      return res.status(404).json({
        status: false,
        error: "Posts unavailable",
      });
    }
    return res.status(200).json({
      status: true,
      data: posts,
    });
  })
    .clone()
    .catch((err) => console.log(err));
};

getPostById = async (req, res) => {
  return await Post.findOne({ _id: req.params.id }, (err, post) => {
    if (err) {
      return res.status(400).json({
        status: false,
        error: err,
      });
    }

    if (!post) {
      return res.status(404).json({
        status: false,
        error: "Post unavailable",
      });
    }
    return res.status(200).json({
      status: true,
      data: post,
    });
  })
    .clone()
    .catch((err) => console.log(err));
};

module.exports = {
  createPost,
  updatePost,
  deletePost,
  getPosts,
  getPostById,
};