const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Create HTTP Server & attach Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Attach io to Express so routes/controllers can use it if needed
app.set('io', io);

// Initialize Socket Events
const initTicketSocket = require('./sockets/ticketSocket');
initTicketSocket(io);

// 1. Middlewares
app.use(cors());
app.use(express.json());

// 2. Database Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/zenflow';
mongoose
  .connect(MONGO_URI)
  .then(() => console.log('🎉 MongoDB Connected Successfully!'))
  .catch((err) => console.error('MongoDB connection error:', err));

// 3. Health Check Root
app.get('/', (req, res) => {
  res.json({ message: 'ZenFlow Backend Engine is up and running!' });
});

// 4. Ticket Routes (Includes /dashboard, /:id, createTicket, etc.)
const ticketRoutes = require('./routes/ticketRoutes');
app.use('/api/tickets', ticketRoutes);

// 5. User Profile Route
app.get('/api/profile', (req, res) => {
  res.status(200).json({
    success: true,
    user: {
      name: 'Dhruvi Shri',
      email: 'dhruvi@example.com',
      role: 'IT Support Specialist',
      department: 'Cloud Operations',
      status: 'Active'
    }
  });
});

// 6. Global Error Handling Middleware (must stay below all routes)
app.use((err, req, res, next) => {
  res.status(500).json({ success: false, message: 'Server Error', error: err.message });
});

// 7. Start Server Listener (Runs Express + Socket.IO together)
server.listen(PORT, () => {
  console.log(`🚀 Server & Sockets running on port ${PORT}`);
});