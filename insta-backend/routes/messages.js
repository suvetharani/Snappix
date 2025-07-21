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

    const newMessage = { sender, receiver, text };
    conversation.messages.push(newMessage);
    await conversation.save();

    res.status(201).json(newMessage);
  } catch (err) {
    res.status(500).json({ error: 'Failed to send message' });
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