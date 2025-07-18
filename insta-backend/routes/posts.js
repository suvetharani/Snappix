// routes/posts.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const Post = require("../models/Post");
const User = require("../models/User"); 

// ✅ Ensure uploads folder exists
const uploadPath = "uploads/";
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}

// ✅ Multer storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// ✅ Create a new post
router.post("/create", upload.single("file"), async (req, res) => {
  try {
    const { username, caption } = req.body;

    if (!req.file) {
      console.error("No file received");
      return res.status(400).json({ msg: "No file uploaded" });
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    const newPost = new Post({
      username,
      caption,
      fileUrl,
    });

    await newPost.save();

    console.log(`✅ New post created by ${username}`);
    res.status(201).json(newPost);
  } catch (err) {
    console.error("Error creating post:", err);
    res.status(500).json({ msg: "Server error creating post" });
  }
});

// ✅ Get a single post by ID
router.get("/single/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: "Post not found" });
    res.json(post);
  } catch (err) {
    console.error("Error fetching post:", err);
    res.status(500).json({ msg: "Server error fetching post" });
  }
});

// ✅ Get all posts by username

// ✅ Add a comment to a post
router.post("/:id/comments", async (req, res) => {
  try {
    const { username, text } = req.body;

    if (!text || !username) {
      return res.status(400).json({ msg: "Username and comment text are required" });
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: "Post not found" });

    post.comments.push({ username, text });
    await post.save();

    console.log(`✅ Comment added by ${username} on post ${req.params.id}`);
    res.status(201).json(post);
  } catch (err) {
    console.error("Error adding comment:", err);
    res.status(500).json({ msg: "Server error adding comment" });
  }
});

// ✅ Delete a post by ID
// ✅ Delete a post
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Post.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ msg: "Post not found" });
    res.json({ msg: "Post deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error deleting post" });
  }
});
// Get all posts from all users
// ✅ Get all posts from all users (MOVE THIS UP ⬆️)
router.get("/all", async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });

    // Fetch profilePic for each post's username
    const postsWithProfile = await Promise.all(
      posts.map(async (post) => {
        const user = await User.findOne({ username: post.username });
        return {
          ...post._doc,
          profilePic: user?.profilePic || null, // Add profilePic to response
        };
      })
    );

    res.json(postsWithProfile);
  } catch (err) {
    console.error("Error fetching posts with profile:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ✅ Get all posts by username (this stays after)
router.get("/:username", async (req, res) => {
  try {
    const posts = await Post.find({ username: req.params.username }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error("Error fetching user's posts:", err);
    res.status(500).json({ msg: "Server error fetching user's posts" });
  }
});


module.exports = router;
