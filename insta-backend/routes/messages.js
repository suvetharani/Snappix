const express = require('express');
const router = express.Router();
const Conversation = require('../models/Conversation');

// Test route
router.get('/test', (req, res) => {
  res.send('Messages route is working!');
});

// Send a new message
router.post('/send', async (req, res) => {
  const { sender, receiver, text } = req.body;
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

    const newMessage = { sender, receiver, text, unreadBy: [receiver] };
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
    res.json(conversation);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get conversation' });
  }
});

module.exports = router; 