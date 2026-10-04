const express = require('express');
const router = express.Router();
const axios = require('axios');
const mongoose = require('mongoose');

// Ensure Ticket Model exists or load it
let Ticket;
try {
  Ticket = mongoose.model('Ticket');
} catch (e) {
  const ticketSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, default: '' },
    category: { type: String, default: 'General' },
    priority: { type: String, default: 'Medium' },
    status: { type: String, default: 'Open' },
    user_id: { type: String, default: 'guest' },
    customerName: { type: String },
    customerEmail: { type: String },
    deflected: { type: Boolean, default: false },
    escalated: { type: Boolean, default: false },
    ai_response: { type: String, default: null },
    retrieved_sources: { type: Array, default: [] },
    createdAt: { type: Date, default: Date.now }
  });
  Ticket = mongoose.model('Ticket', ticketSchema);
}

// 1. POST /api/tickets - Create Ticket
router.post('/', async (req, res) => {
  try {
    let { title, description, category, priority, user_id, customerName, customerEmail, query } = req.body;

    // Handle payload from create-ticket.html if sent as query
    if (!title && query) {
      const parts = query.split(':');
      title = parts[0].trim();
      description = parts.slice(1).join(':').trim() || title;
    }

    const ticketTitle = title || 'Support Request';
    const ticketDescription = description || '';
    const selectedCategory = category || 'General';

    let aiResolution = {
      can_deflect: false,
      answer: null,
      sources: []
    };

    // Forward to FastAPI RAG Microservice on port 8000
    try {
      const ragResponse = await axios.post('http://127.0.0.1:8000/api/v1/rag/query', {
        query: `${ticketTitle}: ${ticketDescription}`.trim(),
        category: selectedCategory
      });

      if (ragResponse && ragResponse.data) {
        aiResolution = ragResponse.data;
      }
    } catch (ragError) {
      console.warn('FastAPI RAG microservice unreachable or returned error:', ragError.message);
    }

    const isDeflected = Boolean(aiResolution.can_deflect);
    const aiResponseText = aiResolution.answer || 'Ticket logged successfully. An agent will review it shortly.';
    const sourcesList = aiResolution.sources || [];

    const newTicket = new Ticket({
      title: ticketTitle,
      description: ticketDescription,
      category: selectedCategory,
      priority: priority || 'Medium',
      user_id: user_id || 'guest',
      customerName: customerName || 'Anonymous',
      customerEmail: customerEmail || 'user@example.com',
      deflected: isDeflected,
      ai_response: aiResponseText,
      retrieved_sources: sourcesList,
      status: isDeflected ? 'Resolved' : 'Open'
    });

    await newTicket.save();

    return res.status(201).json({
      success: true,
      message: isDeflected ? 'Ticket deflected by AI knowledge base.' : 'Ticket created successfully.',
      ticket: newTicket,
      data: newTicket,
      aiData: { ai_response: aiResponseText },
      deflected: newTicket.deflected,
      ai_response: newTicket.ai_response,
      retrieved_sources: newTicket.retrieved_sources
    });

  } catch (error) {
    console.error('Error in ticket creation route:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create ticket',
      error: error.message
    });
  }
});

// 2. PUT /api/tickets/:id - Update Ticket (Resolve / Escalate)
router.put('/:id', async (req, res) => {
  try {
    const { status, priority, isDeflected, escalated } = req.body;
    const updateFields = {};

    if (status !== undefined) updateFields.status = status;
    if (priority !== undefined) updateFields.priority = priority;
    if (isDeflected !== undefined) updateFields.deflected = isDeflected;
    if (escalated !== undefined) updateFields.escalated = escalated;

    const updatedTicket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true }
    );

    if (!updatedTicket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Ticket updated successfully',
      data: updatedTicket
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 3. GET /api/tickets - Fetch all tickets (Ticket History)
router.get('/', async (req, res) => {
  try {
    const tickets = await Ticket.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      data: tickets
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 4. GET /api/tickets/dashboard - Dashboard statistics
router.get('/dashboard', async (req, res) => {
  try {
    const total = await Ticket.countDocuments();
    const deflected = await Ticket.countDocuments({ deflected: true });
    const open = await Ticket.countDocuments({ status: 'Open' });
    const resolved = await Ticket.countDocuments({ status: 'Resolved' });

    return res.status(200).json({
      success: true,
      stats: { total, deflected, open, resolved }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 5. GET /api/tickets/:id - Single ticket details
router.get('/:id', async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }
    return res.status(200).json({ success: true, data: ticket });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;