
// const express = require('express');
// const dotenv = require('dotenv');
// const cors = require('cors');
// const http = require('http');
// const connectDB = require('./config/db');

// dotenv.config();
// connectDB();

// const app = express();
// app.use(express.json());
// app.use(cors());

// const server = http.createServer(app);

// const io = require('socket.io')(server, {
//   cors: {
//     origin: "*",
//     methods: ["GET","POST"]
//   }
// });

// // attach before routes
// app.use((req,res,next) => { req.io = io; next(); });

// const chatRoutes = require('./routes/chatRoutes');
// app.use('/api/chat', chatRoutes);

// io.on('connection', (socket) => {
//   console.log('🔌 Connected:', socket.id);

//   socket.on('joinConversation', (conversationId) => {
//     if (conversationId) {
//       socket.join(conversationId);
//       console.log(`👉 Socket ${socket.id} joined room ${conversationId}`);
//     }
//   });

//   socket.on('disconnect', () => {
//     console.log('❌ Disconnected:', socket.id);
//   });
// });

// const PORT = process.env.PORT || 5000;
// server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));




const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected"))
.catch((err) => console.error("Mongo Error:", err));

const chatSchema = new mongoose.Schema({
  userId: String,
  name: String,
  email: String,
  messages: [
    {
      sender: String, // "user" or "bot"
      message: String,
      timestamp: { type: Date, default: Date.now },
    },
  ],
});

const Chat = mongoose.model("Chat", chatSchema);

app.post("/api/chat", async (req, res) => {
  const { userId, message, name, email } = req.body;

  let chat = await Chat.findOne({ userId });

  if (!chat) {
    chat = new Chat({
      userId,
      name: name || "",
      email: email || "",
      messages: [],
    });
  }

  if (name && !chat.name) chat.name = name;
  if (email && !chat.email) chat.email = email;

  chat.messages.push({ sender: "user", message });
  await chat.save();

  return res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
