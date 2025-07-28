const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  receiver: { type: String, required: true },
  text: { type: String }, // not required for collab_invite
  type: { type: String }, // e.g., 'collab_invite'
  fileUrl: { type: String },
  caption: { type: String },
  postId: { type: String },
  unreadBy: [{ type: String }],
  deletedFor: [{ type: String }],
}, { timestamps: true });

const ConversationSchema = new mongoose.Schema({
  participants: {
    type: [String],
    required: true,
  },
  messages: [MessageSchema],
  deletedBy: [{ type: String }], // usernames who deleted this chat (legacy, can be kept for now)
}, { timestamps: true });

module.exports = mongoose.model('Conversation', ConversationSchema); 