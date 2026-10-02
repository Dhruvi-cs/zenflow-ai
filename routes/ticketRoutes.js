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
    description: { type: String, required: true },
    category: { type: String, default: 'General' },
    priority: { type: String, default: 'Medium' },
    status: { type: String, default: 'Open' },
    user_id: { type: String },
    deflected: { type: Boolean, default: false },
    ai_response: { type: String, default: null },
    retrieved_sources: { type: Array, default: [] },
    createdAt: { type: Date, default: Date.now }
  });
  Ticket = mongoose.model('Ticket', ticketSchema);
}

// 1. POST /api/tickets - Create Ticket with Dynamic Category & Field Mapping
router.post('/', async (req, res) => {
  try {
    const { title, description, category, priority, user_id } = req.body;

    // Use dynamic category from frontend or fallback to 'General'
    const selectedCategory = category || 'General';

    let aiResolution = {
      can_deflect: false,
      answer: null,
      sources: []
    };

    // Forward to FastAPI RAG Microservice on port 8000 with dynamic category
    try {
      const ragResponse = await axios.post('http://127.0.0.1:8000/api/v1/rag/query', {
        query: `${title || ''} ${description || ''}`.trim(),
        category: selectedCategory
      });

      if (ragResponse && ragResponse.data) {
        aiResolution = ragResponse.data;
      }
    } catch (ragError) {
      console.warn('FastAPI RAG microservice unreachable or returned error:', ragError.message);
    }

    // Map RAG response fields as requested by teammate:
    // can_deflect -> deflected
    // answer -> ai_response
    // sources -> retrieved_sources
    const isDeflected = Boolean(aiResolution.can_deflect);
    const aiResponseText = aiResolution.answer || null;
    const sourcesList = aiResolution.sources || [];

    const newTicket = new Ticket({
      title: title || 'Untitled Ticket',
      description: description || '',
      category: selectedCategory, // Save received category
      priority: priority || 'Medium',
      user_id: user_id || 'guest',
      deflected: isDeflected,
      ai_response: aiResponseText,
      retrieved_sources: sourcesList,
      status: isDeflected ? 'Resolved' : 'Open'
    });

    await newTicket.save();

    return res.status(201).json({
      success: true,
      message: isDeflected ? 'Ticket deflected by AI knowledge base.' : 'Ticket created successfully.',
      data: newTicket,
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

// 2. GET /api/tickets - Fetch all tickets (Ticket History)
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

// 3. GET /api/tickets/dashboard - Dashboard statistics
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

// 4. GET /api/tickets/:id - Single ticket details
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