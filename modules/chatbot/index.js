const express = require('express');
const engine = require('./engine');
const router = express.Router();

router.post('/chat', (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  // Generate response
  const answer = engine.processMessage(message);

  res.json({
    reply: answer
  });
});

module.exports = router;
