// server.js
<<<<<<< HEAD
import dns from 'node:dns';
// Force Node.js to use Google/Cloudflare DNS for MongoDB SRV resolution
dns.setServers(['8.8.8.8', '1.1.1.1']);

import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import initTicketSocket from './sockets/ticketSocket.js';
import aiRoutes from './aiRoutes.js';

dotenv.config();
=======
const dns = require('node:dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
>>>>>>> origin/main

const app = express();

// Create HTTP server for Express and Socket.io
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api/ai', aiRoutes);

// Initialize Socket.io with CORS
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Initialize Socket logic
initTicketSocket(io);

// Connect to MongoDB Cloud Database
if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('🍃 MongoDB Cloud Connected Successfully'))
    .catch((err) => console.error('❌ Database Connection Error:', err));
} else {
  console.log('⚠️ MONGO_URI not found in .env – Running server without DB');
}

// Routes
const ticketRoutes = require('./routes/ticketRoutes');
app.use('/api/tickets', ticketRoutes);

// Base route for health check
app.get('/', (req, res) => {
  res.json({ message: "ZenFlow Backend Engine is up and running!" });
});

// Database Connection
// Database Connection with explicit error logging
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000 // Timeout faster (5 seconds instead of 10)
})
  .then(() => console.log('🎉 MongoDB Connected Successfully!'))
  .catch((err) => {
    console.error('❌ Database Connection Error Name:', err.name);
    console.error('❌ Database Connection Error Message:', err.message);
  });

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});