const mongoose = require("mongoose");

// ✅ Separate Comment sub-schema
const commentSchema = new mongoose.Schema({
  username: { type: String, required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// ✅ Post schema with embedded comments
const postSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    caption: { type: String },
    fileUrl: { type: String, required: true }, // Store image/video path
    likes: [{ type: String }], // usernames who liked
    comments: [commentSchema], // embedded comments
  },
  { timestamps: true } // adds createdAt, updatedAt automatically
);

module.exports = mongoose.model("Post", postSchema);
