// routes/posts.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const Post = require("../models/Post");
const User = require("../models/User"); 
const mongoose = require("mongoose");

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

// like for a post
router.post("/:id/like", async (req, res) => {
  const { username } = req.body;

  try {
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.likes.includes(username)) {
      // Already liked → remove like
      post.likes = post.likes.filter((u) => u !== username);
    } else {
      // Not liked yet → add like
      post.likes.push(username);
    }

    await post.save();
    res.status(200).json({ likes: post.likes.length });
  } catch (err) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Get list of usernames who liked a post
// ✅ Get list of usernames who liked a post
// ✅ Get list of usernames who liked a post
// Get list of usernames who liked a post
// GET /api/posts/:id/likers
router.get('/:postId/likers', async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found." });

    // Fetch usernames from likes array
    const users = await User.find({ username: { $in: post.likes } })
      .select('username profilePic -_id');

    // Map to add full URL if needed
    const likers = users.map(user => ({
      username: user.username,
      profilePic: user.profilePic
        ? user.profilePic.startsWith('/uploads/')
          ? `http://localhost:5000${user.profilePic}`
          : `http://localhost:5000/uploads/${user.profilePic}`
        : "http://localhost:5000/default-profile.png"
    }));

    res.json({ likers });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});
// ✅ Get all posts by username
// ✅ Add a comment to a post
router.post("/:postId/comments", async (req, res) => {
  try {
    const { username, text } = req.body;
    const { postId } = req.params;

    if (!username || !text) {
      return res.status(400).json({ msg: "Username and comment text are required" });
    }

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ msg: "Post not found" });

    const newComment = {
      username,
      text,
      likes: [],
      replies: [],
      createdAt: new Date(),
    };

    post.comments.push(newComment);
    await post.save();

    res.status(201).json(post.comments[post.comments.length - 1]); // Return the new comment
  } catch (err) {
    console.error("❌ Error adding comment:", err);
    res.status(500).json({ msg: "Server error adding comment" });
  }
});

// ✅ Add a comment to a post
// ✅ Like or unlike a comment
router.post("/:postId/comments/:commentId/like", async (req, res) => {
  const { username } = req.body;
  const { postId, commentId } = req.params;

  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ msg: "Post not found" });

    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ msg: "Comment not found" });

    const index = comment.likes.indexOf(username);
    if (index === -1) {
      comment.likes.push(username); // like
    } else {
      comment.likes.splice(index, 1); // unlike
    }

    await post.save();
    res.status(200).json(comment);
  } catch (err) {
    console.error("Error liking comment:", err);
    res.status(500).json({ msg: "Server error liking comment" });
  }
});

// ✅ Reply to a comment
// Like/unlike a comment
router.post('/:postId/comments/:commentId/like', async (req, res) => {
  const { postId, commentId } = req.params;
  const { username, text } = req.body;

  try {
    const post = await Post.findById(postId);
    const comment = post.comments.id(commentId);

    if (!comment) return res.status(404).send("Comment not found");

    const alreadyLiked = comment.likes.includes(username);

    if (alreadyLiked) {
      comment.likes.pull(username); // Unlike
    } else {
      comment.likes.push(username); // Like
    }

    await post.save();
    res.json(comment); // Return updated comment
  } catch (err) {
    res.status(500).send("Server error");
  }
});

// Reply to comment
// ✅ Reply to a comment on a post
router.post("/:postId/comments/:commentId/replies", async (req, res) => {
  try {
    const { username, text } = req.body;
    const { postId, commentId } = req.params;

    if (!text || !username) {
      return res.status(400).json({ msg: "Username and reply text are required" });
    }

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ msg: "Post not found" });

    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ msg: "Comment not found" });

    comment.replies.push({ username, text });
    await post.save();

    const newReply = comment.replies[comment.replies.length - 1];
    res.status(201).json(newReply);
  } catch (err) {
    console.error("❌ Error posting reply:", err);
    res.status(500).json({ msg: "Server error posting reply" });
  }
});

router.patch("/:postId/comments/:commentId/replies/:replyId/like", async (req, res) => {
  try {
    const { userId } = req.body;
    const { postId, commentId, replyId } = req.params;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ msg: "Post not found" });

    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ msg: "Comment not found" });

    const reply = comment.replies.id(replyId);
    if (!reply) return res.status(404).json({ msg: "Reply not found" });

    // Toggle like
    if (!reply.likes.includes(userId)) {
      reply.likes.push(userId);
    } else {
      reply.likes = reply.likes.filter((id) => id !== userId);
    }

    await post.save();
    res.status(200).json({ likes: reply.likes });
  } catch (err) {
    console.error("❌ Error liking reply:", err);
    res.status(500).json({ msg: "Server error while liking reply" });
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

// Save or Unsave a post
router.post('/:postId/save', async (req, res) => {
  const { postId } = req.params;
  const { username } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "User not found" });

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const userIndex = user.savedPosts.findIndex(id => id.toString() === postId.toString());
    const postIndex = post.savedBy.findIndex(u => u === username);

    if (userIndex > -1) {
      // Unsave post
      user.savedPosts.splice(userIndex, 1);
      if (postIndex > -1) {
        post.savedBy.splice(postIndex, 1);
      }
    } else {
      // Save post
      user.savedPosts.push(postId.toString());
      if (postIndex === -1) {
        post.savedBy.push(username);
      }
    }

    await user.save();
    await post.save();
    res.json({ message: "Saved posts updated", savedPosts: user.savedPosts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});
// GET /api/users/:username/saved
// GET saved posts of a user
router.get('/:username/saved', async (req, res) => {
  const { username } = req.params;

  try {
    const savedPosts = await Post.find({ savedBy: username });
    const savedPostIds = savedPosts.map(post => post._id.toString());

    res.json({ savedPosts: savedPostIds }); // 👈 Must match what frontend expects
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while fetching saved posts" });
  }
});

module.exports = router;