
const express = require('express');
const {
  sendUserMessage,
  sendAgentReply,
  getMessages,
  listConversations,
  closeConversation,   // <-- add
} = require('../controllers/chatController');

const router = express.Router();

router.post('/send', sendUserMessage);
router.post('/agent/reply', sendAgentReply);
router.get('/messages/:conversationId', getMessages);
router.get('/conversations', listConversations);
router.post('/close', closeConversation);  // <-- new
module.exports = router;
