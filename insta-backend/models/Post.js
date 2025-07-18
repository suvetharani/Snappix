const mongoose = require("mongoose");

// Reply schema
const replySchema = new mongoose.Schema({
  username: { type: String, required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Comment schema
const commentSchema = new mongoose.Schema({
  username: { type: String, required: true },
  text: { type: String, required: true },
  likes: [{ type: String }],
  replies: [replySchema], // ✅ Nested replies array
  createdAt: { type: Date, default: Date.now },
});

// Post schema
const postSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    caption: { type: String },
    fileUrl: { type: String, required: true },
    likes: [{ type: String }],
    comments: [commentSchema], // Embedded comments with replies
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);
