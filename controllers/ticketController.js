const Ticket = require('../models/Ticket');
const axios = require('axios');

// POST /api/tickets - Create ticket and process through AI microservice
exports.createTicket = async (req, res) => {
  try {
    const { customerName, customerEmail, query } = req.body;

    if (!customerName || !customerEmail || !query) {
      return res.status(400).json({ message: 'customerName, customerEmail, and query are required.' });
    }

    let aiData = {
      ticket_id: 'temp-id',
      deflected: false,
      ai_response: 'AI service temporarily unavailable. Please assign this ticket to a human agent.',
      confidence_score: 0.5,
      retrieved_sources: [],
      error: null
    };

    // Call Python FastAPI RAG microservice
    try {
      const aiResponse = await axios.post('http://127.0.0.1:8000/ask', {
        query: query,
        category: 'General'
      }, { timeout: 25000 });

      if (aiResponse.data) {
        aiData = {
          ticket_id: 'temp-id',
          deflected: Boolean(aiResponse.data.deflected),
          ai_response: aiResponse.data.ai_response || aiResponse.data.response || '',
          confidence_score: typeof aiResponse.data.confidence_score === 'number' ? aiResponse.data.confidence_score : 0.5,
          retrieved_sources: aiResponse.data.retrieved_sources || [],
          error: aiResponse.data.error || null
        };
      }
    } catch (aiErr) {
      console.error('AI microservice call failed:', aiErr.message);
      aiData.error = aiErr.message;
    }

    const newTicket = new Ticket({
      customerName,
      customerEmail,
      query,
      status: aiData.deflected ? 'Deflected' : 'Open',
      aiResponse: aiData.ai_response,
      confidenceScore: aiData.confidence_score,
      retrievedSources: aiData.retrieved_sources
    });

    const savedTicket = await newTicket.save();
    aiData.ticket_id = savedTicket._id;

    return res.status(201).json({
      message: 'Ticket created successfully',
      ticket: savedTicket,
      aiData
    });
  } catch (error) {
    console.error('Error in createTicket:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/tickets - Fetch ticket history
exports.getAllTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find().sort({ createdAt: -1 });
    return res.status(200).json(tickets);
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/tickets/dashboard - Aggregations and metrics
exports.getDashboardMetrics = async (req, res) => {
  try {
    const totalTickets = await Ticket.countDocuments();
    const deflectedTickets = await Ticket.countDocuments({ status: 'Deflected' });
    const openTickets = await Ticket.countDocuments({ status: 'Open' });
    const resolvedTickets = await Ticket.countDocuments({ status: 'Resolved' });

    const deflectionRate = totalTickets > 0 
      ? Math.round((deflectedTickets / totalTickets) * 100) 
      : 0;

    return res.status(200).json({
      totalTickets,
      deflectedTickets,
      openTickets,
      resolvedTickets,
      deflectionRate: `${deflectionRate}%`
    });
  } catch (error) {
    console.error('Error in getDashboardMetrics:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/tickets/:id - Get single ticket by ID
exports.getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    return res.status(200).json(ticket);
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PUT /api/tickets/:id - Update ticket status / details
exports.updateTicket = async (req, res) => {
  try {
    const updatedTicket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!updatedTicket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    return res.status(200).json(updatedTicket);
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};