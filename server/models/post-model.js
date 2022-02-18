const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const opts = { toJSON: { virtuals: true } };
const Post = new Schema(
  {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      index: true,
      required: true,
      auto: true,
    },
    title: { type: String, required: true },
    author: { type: String, required: true },
    description: { type: String, required: true },
  },
  { timestamps: true },
  opts
);

module.exports = mongoose.model("post", Post);
