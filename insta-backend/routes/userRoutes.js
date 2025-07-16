// server/routes/userRoutes.js

const express = require("express");
const router = express.Router();
const User = require("../models/User"); // adjust to your User model path

// ✅ Add this new search route:
// routes/userRoutes.js
router.get("/users", async (req, res) => {
  const { username } = req.query;

  try {
    const users = await User.find({
      username: { $regex: username, $options: "i" } // case-insensitive match
    }).select("username _id");

    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
