const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
  userId: { type: String, required: true },

  // Profile Fields
  name: { type: String },
  email: { type: String },
  phone: { type: String },
  department: { type: String },  // e.g. technical / sales / support
  firstQuery: { type: String },

  agentId: { type: String },
  status: { type: String, default: 'open' },
  lastMessageAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Conversation', ConversationSchema);
