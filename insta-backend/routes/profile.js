const express = require('express');
const router = express.Router();
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Serve static files from /uploads
// Make sure in your server.js:
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
 * Fetch profile by username
 */
router.get('/:username', async (req, res) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({ username })
      .populate('followers', 'username profilePic')
      .populate('following', 'username profilePic');

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json({
      username: user.username,
      bio: user.bio,
      profilePic: user.profilePic,
      followers: user.followers,
      following: user.following
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


/**
 * PUT /api/profile/update
 * Update profile bio + picture
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
 * Follow or unfollow a user
 * Body: { username: userToFollow, follower: loggedInUser }
 */
router.post('/follow', async (req, res) => {
  const { username, follower } = req.body;

  try {
    const userToFollow = await User.findOne({ username });
    const followerUser = await User.findOne({ username: follower });

    if (!userToFollow || !followerUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const isAlreadyFollowing = userToFollow.followers.includes(follower);

    if (isAlreadyFollowing) {
      // Unfollow
      userToFollow.followers = userToFollow.followers.filter(name => name !== follower);
      followerUser.following = followerUser.following.filter(name => name !== username);
    } else {
      // Follow
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





module.exports = router;
