const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Sign Up
router.post('/signup', async (req, res) => {
  const { fullname, username, password } = req.body;

  if (!fullname || !username || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists." });
    }

    const newUser = new User({ fullname, username, password });
    await newUser.save();
    return res.status(201).json({ message: "User registered successfully!" });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Log In
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const user = await User.findOne({ username });
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    return res.status(200).json({ message: "Login successful!" });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});
// Get profile by username
router.get('/profile/:username', async (req, res) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


module.exports = router;
