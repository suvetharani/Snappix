const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  sender: {
    type: String,
    required: true,
  },
  receiver: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  unreadBy: [{ type: String }], // usernames who haven't read this message
}, { timestamps: true });

const ConversationSchema = new mongoose.Schema({
  participants: {
    type: [String],
    required: true,
  },
  messages: [MessageSchema],
}, { timestamps: true });

module.exports = mongoose.model('Conversation', ConversationSchema); 