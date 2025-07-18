// models/User.js

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true, // NOTE: Hash in production!
  },
  bio: {
    type: String,
    default: "",
  },

  profilePic: {
    type: String,
    default: "", // or null
  },

  followers: [String],  // store usernames directly
  following: [String],

  savedPosts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
  }],
});

module.exports = mongoose.model('User', UserSchema);
