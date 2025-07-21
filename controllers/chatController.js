const Conversation = require('../models/conversation');
const Message = require('../models/message');

/* User sends message */

exports.sendUserMessage = async (req, res) => {
  try {
    const {
      userId,
      text,
      name,
      email,
      phone,
      department,
      firstQuery,
      isFirst = false   // front-end se bhejenge jab profile complete ho
    } = req.body;

    if (!userId || !text) return res.status(400).json({ error: 'userId & text required' });

    let conversation = await Conversation.findOne({ userId, status: { $ne: 'closed' } });

    if (!conversation) {
      // Agar conversation nahi hai to must be first init
      conversation = await Conversation.create({
        userId,
        name: name || undefined,
        email: email || undefined,
        phone: phone || undefined,
        department: department || undefined,
        firstQuery: firstQuery || text
      });
    } else if (isFirst) {
      // Agar existing hai but profile blank thi (edge case)
      if (name) conversation.name = name;
      if (email) conversation.email = email;
      if (phone) conversation.phone = phone;
      if (department) conversation.department = department;
      if (firstQuery) conversation.firstQuery = firstQuery;
      await conversation.save();
    }

    const message = await Message.create({
      conversationId: conversation._id,
      sender: 'user',
      text,
      meta: isFirst ? { profile: { name, email, phone, department, firstQuery: firstQuery || text } } : {}
    });

    conversation.lastMessageAt = new Date();
    await conversation.save();

    const payload = {
      _id: message._id,
      conversationId: conversation._id.toString(),
      sender: 'user',
      text: message.text,
      createdAt: message.createdAt
    };

    req.io.to(conversation._id.toString()).emit('receiveMessage', payload);

    res.json({
      success: true,
      conversationId: conversation._id,
      message: payload,
      conversation // so CRM can show profile after first message
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
};





/* Agent reply */
exports.sendAgentReply = async (req, res) => {
  try {
    const { conversationId, text, agentId } = req.body;
    if (!conversationId || !text) return res.status(400).json({ error: 'conversationId & text required' });

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return res.status(404).json({ error: 'Conversation not found' });

    if (agentId && !conversation.agentId) conversation.agentId = agentId;
    conversation.lastMessageAt = new Date();
    await conversation.save();

    const message = await Message.create({
      conversationId,
      sender: 'agent',
      text
    });

    const payload = {
      _id: message._id,
      conversationId,
      sender: 'agent',
      text: message.text,
      createdAt: message.createdAt
    };

    req.io.to(conversationId).emit('receiveMessage', payload);
    res.json({ success: true, message: payload });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

/* All messages of a conversation */
exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const msgs = await Message.find({ conversationId }).sort({ createdAt: 1 });
    res.json(msgs);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

/* Sidebar list for CRM */
exports.listConversations = async (_req, res) => {
  try {
    const convos = await Conversation.find().sort({ lastMessageAt: -1 }).lean();
    res.json(convos);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};




exports.closeConversation = async (req, res) => {
  try {
    const { conversationId } = req.body;
    if (!conversationId) return res.status(400).json({ error: 'conversationId required' });

    const convo = await Conversation.findByIdAndUpdate(
      conversationId,
      { status: 'closed' },
      { new: true }
    );
    if (!convo) return res.status(404).json({ error: 'Conversation not found' });

    res.json({ success: true, conversation: convo });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
};
