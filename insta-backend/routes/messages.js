const express = require('express');
const router = express.Router();
const Conversation = require('../models/Conversation');

// Test route
router.get('/test', (req, res) => {
  res.send('Messages route is working!');
});

// Send a new message
router.post('/send', async (req, res) => {
  const { sender, receiver, text, type, fileUrl, caption, postId } = req.body;
  try {
    let conversation = await Conversation.findOne({
      participants: { $all: [sender, receiver] },
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [sender, receiver],
        messages: [],
      });
    }

    // Remove sender from deletedBy if present (so chat reappears for them)
    if (conversation.deletedBy && conversation.deletedBy.includes(sender)) {
      conversation.deletedBy = conversation.deletedBy.filter(u => u !== sender);
    }

    const newMessage = {
      sender,
      receiver,
      text,
      type,
      fileUrl,
      caption,
      postId,
      unreadBy: [receiver],
      deletedFor: [],
    };
    conversation.messages.push(newMessage);
    await conversation.save();

    res.status(201).json(newMessage);
  } catch (err) {
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Mark all messages as read in a conversation for a user
router.post('/mark-read', async (req, res) => {
  const { user1, user2 } = req.body;
  try {
    const conversation = await Conversation.findOne({
      participants: { $all: [user1, user2] },
    });
    if (conversation) {
      conversation.messages.forEach(msg => {
        msg.unreadBy = msg.unreadBy.filter(u => u !== user1);
      });
      await conversation.save();
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
});

// Delete chat for a user (delete all messages for user1)
router.post('/delete-chat', async (req, res) => {
  const { user1, user2 } = req.body;
  try {
    const conversation = await Conversation.findOne({
      participants: { $all: [user1, user2] },
    });
    if (conversation) {
      conversation.messages.forEach(msg => {
        if (!msg.deletedFor.includes(user1)) {
          msg.deletedFor.push(user1);
        }
      });
      await conversation.save();
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete chat' });
  }
});

// Get conversation between two users
router.get('/:user1/:user2', async (req, res) => {
  const { user1, user2 } = req.params;
  try {
    const conversation = await Conversation.findOne({
      participants: { $all: [user1, user2] },
    });
    if (!conversation) {
      return res.json({ messages: [] });
    }
    // Only return messages not deleted for user1
    const filtered = {
      ...conversation.toObject(),
      messages: conversation.messages.filter(msg => !msg.deletedFor.includes(user1)),
    };
    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get conversation' });
  }
});

module.exports = router; 