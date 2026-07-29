// server.js
const dns = require('node:dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

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
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});