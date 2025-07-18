const mongoose = require("mongoose");

// ✅ Sub-schema for replies
const replySchema = new mongoose.Schema({
  username: { type: String, required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// ✅ Updated comment sub-schema with likes & replies
const commentSchema = new mongoose.Schema({
  username: { type: String, required: true },
  text: { type: String, required: true },
  likes: [{ type: String }], // usernames who liked this comment
  replies: [replySchema], // embedded replies
  createdAt: { type: Date, default: Date.now },
});

// ✅ Post schema with embedded comments
const postSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    caption: { type: String },
    fileUrl: { type: String, required: true }, // Store image/video path
    likes: [{ type: String }], // usernames who liked the post
    comments: [commentSchema], // embedded comments with likes & replies
  },
  { timestamps: true } // adds createdAt, updatedAt
);

module.exports = mongoose.model("Post", postSchema);
