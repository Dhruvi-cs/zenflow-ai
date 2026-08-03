// routes/ticketRoutes.js
const express = require('express');
const router = express.Router();
const {
  createTicket,
  getAllTickets,
  getTicketById,
  updateTicket
} = require('../controllers/ticketController');

// Define routes
router.post('/', createTicket);
router.get('/', getAllTickets);
router.get('/:id', getTicketById);
router.put('/:id', updateTicket);

module.exports = router;