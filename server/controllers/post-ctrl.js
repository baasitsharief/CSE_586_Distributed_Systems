const axios = require("axios");
const Post = require("../models/post-model");

commitCreate = (res, post) => {
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

  var count = 0;

  if (process.env.MASTER === "yes") {
    for (var i = 1; i < 3; i++) {
      axios
        .post(`http://api-server-${i}:5000/api/post`, body)
        .then(function (response) {
          // console.log(response.status);
          if (response.status == 201) count++;
          // console.log(count);
          if (count == 2) {
            commitCreate(res, post);
          }
        })
        .catch(function (error) {
          // handle error
          console.log(error);
        });
    }
  } else {
    commitCreate(res, post);
  }
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
