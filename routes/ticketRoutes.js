const express = require('express');
const router = express.Router();

const {
  createTicket,
  getAllTickets,
  getTicketById,
  updateTicket,
  getDashboardMetrics
} = require('../controllers/ticketController');

// Standard ticket endpoints
router.post('/', createTicket);
router.get('/', getAllTickets);

// Dashboard aggregation endpoint (MUST remain above dynamic /:id route)
router.get('/dashboard', getDashboardMetrics);

// Parameterized ticket endpoints
router.get('/:id', getTicketById);
router.put('/:id', updateTicket);

module.exports = router;