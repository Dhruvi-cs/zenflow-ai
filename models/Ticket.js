// models/Ticket.js
const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  query: { type: String, required: true }, // The message submitted by customer
  
  // Fields Chesta (AI) will fill in Week 4:
  category: { type: String, default: "Unclassified" }, // billing, tech support, etc.
  urgency: { type: String, enum: ["Low", "Medium", "High"], default: "Low" },
  sentiment: { type: String, default: "Neutral" }, // Frustrated, Angry, Neutral
  aiSummary: { type: String, default: "" }, // Brief context summary for agents
  
  // Fields you (Dhruvi) will manage via load-balancing:
  status: { type: String, enum: ["Open", "In-Progress", "Resolved"], default: "Open" },
  assignedAgent: { type: String, default: "Unassigned" }, 
  
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Ticket', TicketSchema);