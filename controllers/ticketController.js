// controllers/ticketController.js
const Ticket = require('../models/Ticket');

// 1. Create a new ticket (POST /api/tickets)
exports.createTicket = async (req, res) => {
  try {
    const { customerName, customerEmail, query } = req.body;

    if (!customerName || !customerEmail || !query) {
      return res.status(400).json({ message: "Please fill in all required fields." });
    }

    const newTicket = new Ticket({
      customerName,
      customerEmail,
      query
    });

    const savedTicket = await newTicket.save();
    res.status(201).json({ message: "Ticket created successfully!", ticket: savedTicket });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 2. Fetch all tickets (GET /api/tickets)
exports.getAllTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find().sort({ createdAt: -1 });
    res.status(200).json(tickets);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 3. Fetch a single ticket by ID (GET /api/tickets/:id)
exports.getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }
    res.status(200).json(ticket);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 4. Update ticket status / assigned agent (PUT /api/tickets/:id)
exports.updateTicket = async (req, res) => {
  try {
    const updatedTicket = await Ticket.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedTicket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    res.status(200).json({ message: "Ticket updated!", ticket: updatedTicket });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};