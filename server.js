// server.js
import dns from 'node:dns';
<<<<<<< HEAD
// Force Node.js to use Google/Cloudflare DNS for MongoDB SRV resolution
dns.setServers(['8.8.8.8', '1.1.1.1']);

import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import initTicketSocket from './sockets/ticketSocket.js';
=======
dns.setServers(['8.8.8.8', '1.1.1.1']);

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import http from 'http';
import dotenv from 'dotenv';
import initSockets from './sockets/ticketSocket.js';
>>>>>>> origin/main

dotenv.config();

const app = express();
const server = http.createServer(app);
initSockets(server);

// Create HTTP server for Express and Socket.io
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Socket.io with CORS
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Initialize Socket logic (Week 2 real-time chat)
initTicketSocket(io);

// Connect to MongoDB Cloud Database (Optional check)
if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('🎉 MongoDB Cloud Connected Successfully!'))
    .catch((err) => console.error('❌ Database Connection Error:', err));
} else {
  console.log('⚠️ MONGO_URI not found in .env — Running server without database connection.');
}
// Connect to MongoDB Cloud Database
//mongoose.connect(process.env.MONGO_URI)
  //.then(() => console.log('🍃 MongoDB Cloud Connected Successfully'))
 // .catch((err) => console.error('❌ Database Connection Error:', err));

// Base Route to check if server is running
app.get('/', (req, res) => {
  res.json({ message: "Welcome to ZenFlow AI Backend Engine!" });
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});