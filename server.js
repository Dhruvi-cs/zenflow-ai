// server.js
// Force Node.js to use Google/Cloudflare DNS for MongoDB SRV resolution
const dns = require('node:dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Allows the server to accept JSON data

// Connect to MongoDB Cloud Database
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('🎉 MongoDB Cloud Connected Successfully!'))
  .catch((err) => console.error('❌ Database Connection Error:', err));

// Base Route to check if server is running
app.get('/', (req, res) => {
  res.json({ message: "Welcome to ZenFlow AI Backend Engine!" });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});