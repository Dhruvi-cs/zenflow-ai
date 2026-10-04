const mongoose = require('mongoose');

module.exports = function initTicketSocket(io) {
  io.on("connection", (socket) => {
    console.log(`⚡ Real-time client connected: ${socket.id}`);

    // Send initial handshake confirmation
    socket.emit("welcome", {
      message: "Connected to ZenFlow Real-Time Server",
      socketId: socket.id
    });

    // Room partitioning by ticketId & auto-loading past chat history
    socket.on("join_ticket", async (ticketId) => {
      socket.join(ticketId);
      console.log(`Socket ${socket.id} joined ticket room: ${ticketId}`);

      // Strip "ticket_" prefix if present to obtain the raw MongoDB ObjectId
      const rawId = (typeof ticketId === 'string') ? ticketId.replace('ticket_', '') : ticketId;

      try {
        if (mongoose.Types.ObjectId.isValid(rawId)) {
          const Ticket = mongoose.model('Ticket');
          const ticket = await Ticket.findById(rawId).select('messages');
          if (ticket && Array.isArray(ticket.messages) && ticket.messages.length > 0) {
            socket.emit("load_history", ticket.messages);
          }
        }
      } catch (err) {
        console.error("Error loading chat history from MongoDB:", err.message);
      }
    });

    // Bidirectional chat messaging & persistent storage in MongoDB
    socket.on("send_message", async (data) => {
      console.log(`Chat message received in room ${data.ticketId}:`, data);

      const rawId = (typeof data.ticketId === 'string') ? data.ticketId.replace('ticket_', '') : data.ticketId;
      const messageDoc = {
        sender: data.sender,
        message: data.message,
        timestamp: data.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      try {
        if (mongoose.Types.ObjectId.isValid(rawId)) {
          const Ticket = mongoose.model('Ticket');
          await Ticket.findByIdAndUpdate(rawId, {
            $push: { messages: messageDoc }
          });
        }
      } catch (err) {
        console.error("Error persisting chat message to MongoDB:", err.message);
      }

      // Broadcast to all participants in this ticket's room
      io.to(data.ticketId).emit("receive_message", data);
    });

    // Live typing indicators
    socket.on("typing", (data) => {
      socket.to(data.ticketId).emit("user_typing", {
        username: data.username || "Support Agent"
      });
    });

    socket.on("stop_typing", (data) => {
      socket.to(data.ticketId).emit("user_stopped_typing");
    });

    socket.on("disconnect", () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });
};