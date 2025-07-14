const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

const router = express.Router();

// Register
router.post("/signup", async (req, res) => {
  try {
    const { fullname, username, password } = req.body;

    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ message: "Username already exists" });

    const hashed = await bcrypt.hash(password, 10);

    const newUser = new User({ fullname, username, password: hashed });
    await newUser.save();

    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // You can sign a JWT here if needed:
    // const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    res.json({ message: "Login successful", user: { id: user._id, fullname: user.fullname } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
