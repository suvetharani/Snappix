// server/routes/userRoutes.js

const express = require("express");
const router = express.Router();
const User = require("../models/User"); // adjust to your User model path

// Search for users by username
router.get("/", async (req, res) => {
  const { username } = req.query;
  try {
    const users = await User.find({
      username: { $regex: "^" + username, $options: "i" },
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get all users except the current user
router.get("/all", async (req, res) => {
  const exclude = req.query.exclude;
  try {
    const query = exclude ? { username: { $ne: exclude } } : {};
    const users = await User.find(query).select("username profilePic fullname");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;