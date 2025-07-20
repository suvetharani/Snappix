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
    required: true,
  },
  bio: {
    type: String,
    default: "",
  },
  profilePic: {
    type: String,
    default: "",
  },
  followers: [String],
  following: [String],
savedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }], 
}, {
  timestamps: true  // ✅ Add this line
});


module.exports = mongoose.model('User', UserSchema);
