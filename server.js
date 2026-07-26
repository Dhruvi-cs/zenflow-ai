// server.js
import dns from 'node:dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import http from 'http';
import dotenv from 'dotenv';
import initSockets from './sockets/ticketSocket.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
initSockets(server);

// Middleware
app.use(cors());
app.use(express.json());

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