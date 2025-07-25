
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
// const { PORT } = require('./config/config');
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


// server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));


// server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const connectDB = require('./config/db');

dotenv.config(); // Load .env config

connectDB(); // MongoDB connection

const app = express();
app.use(express.json());
app.use(cors());

// Create HTTP server and bind socket.io to it
const server = http.createServer(app);

const io = require('socket.io')(server, {
  cors: {
    origin: "*", // OR specify your frontend URL
    methods: ["GET", "POST"]
  }
});

// Make io accessible in all routes via req.io
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Import Routes
const chatRoutes = require('./routes/chatRoutes');
const { PORT } = require('./config/config');
app.use('/api/chat', chatRoutes); // All chat APIs go here

// Socket.io Events
io.on('connection', (socket) => {
  console.log('🔌 New client connected:', socket.id);

  // Join conversation room
  socket.on('joinConversation', (conversationId) => {
    if (conversationId) {
      socket.join(conversationId);
      console.log(`👉 Socket ${socket.id} joined room ${conversationId}`);
    }
  });

  // Handle message sending
  socket.on('sendMessage', ({ conversationId, message }) => {
    if (conversationId && message) {
      console.log(`💬 Message received for ${conversationId}: ${message}`);
      io.to(conversationId).emit('newMessage', {
        conversationId,
        message,
        
      });
    }
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

// Start server

server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
