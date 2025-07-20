const express = require('express');
const router = express.Router();
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ✅ Static for uploads:
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

/**
 * GET /api/profile/:username
 * Return: { username, bio, profilePic, followers: [ { username, profilePic } ], following: [ { username, profilePic } ] }
 */
router.get('/:username', async (req, res) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({ username }).lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Lookup followers by username
    const followers = await User.find({ username: { $in: user.followers } })
      .select('username profilePic -_id');

    const following = await User.find({ username: { $in: user.following } })
      .select('username profilePic -_id');

    res.json({
      username: user.username,
      bio: user.bio,
      profilePic: user.profilePic,
      followers,
      following
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/**
 * PUT /api/profile/update
 * Update bio & pic
 */
router.put('/update', upload.single('profilePic'), async (req, res) => {
  const { username, bio } = req.body;

  try {
    const updateData = { bio };
    if (req.file) {
      updateData.profilePic = `/uploads/${req.file.filename}`;
    }

    const user = await User.findOneAndUpdate(
      { username },
      { $set: updateData },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json({ message: "Profile updated!", user });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/**
 * POST /api/profile/follow
 * Body: { username: userToFollow, follower: yourUsername }
 */
router.post('/follow', async (req, res) => {
  const { username, follower } = req.body;

  try {
    // `username` is the target user to follow/unfollow
    // `follower` is the logged-in user who wants to follow/unfollow

    const userToFollow = await User.findOne({ username });
    const followerUser = await User.findOne({ username: follower });

    if (!userToFollow || !followerUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const isAlreadyFollowing = userToFollow.followers.includes(follower);

    if (isAlreadyFollowing) {
      // 🔴 Unfollow logic
      userToFollow.followers = userToFollow.followers.filter(name => name !== follower);
      followerUser.following = followerUser.following.filter(name => name !== username);
    } else {
      // 🟢 Follow logic
      userToFollow.followers.push(follower);
      followerUser.following.push(username);
    }

    await userToFollow.save();
    await followerUser.save();

    res.json({
      message: isAlreadyFollowing ? 'Unfollowed successfully' : 'Followed successfully',
      followers: userToFollow.followers,
      following: followerUser.following
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/**
 * GET /api/posts/:username/saved
 * Return: { savedPosts: [postId1, postId2, ...] }
 */
router.get('/:username/saved', async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: "User not found" });
    // Return the savedPosts array from the user document
    res.json({ savedPosts: user.savedPosts.map(id => id.toString()) });
  } catch (err) {
    res.status(500).json({ error: "Server error while fetching saved posts" });
  }
});


module.exports = router;