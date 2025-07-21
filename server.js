
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors());

const server = http.createServer(app);

const io = require('socket.io')(server, {
  cors: {
    origin: "*",
    methods: ["GET","POST"]
  }
});

// attach before routes
app.use((req,res,next) => { req.io = io; next(); });

const chatRoutes = require('./routes/chatRoutes');
app.use('/api/chat', chatRoutes);

io.on('connection', (socket) => {
  console.log('🔌 Connected:', socket.id);

  socket.on('joinConversation', (conversationId) => {
    if (conversationId) {
      socket.join(conversationId);
      console.log(`👉 Socket ${socket.id} joined room ${conversationId}`);
    }
  });

  socket.on('disconnect', () => {
    console.log('❌ Disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
