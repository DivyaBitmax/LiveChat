
const express = require('express');
const {
  sendUserMessage,
  sendAgentReply,
  getMessages,
  listConversations
} = require('../controllers/chatController');

const router = express.Router();

router.post('/send', sendUserMessage);
router.post('/agent/reply', sendAgentReply);
router.get('/messages/:conversationId', getMessages);
router.get('/conversations', listConversations);

module.exports = router;
