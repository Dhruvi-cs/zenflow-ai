module.exports = function initTicketSocket(io) {
  io.on("connection", (socket) => {
    console.log(`⚡ Real-time client connected: ${socket.id}`);

    // Send initial handshake confirmation
    socket.emit("welcome", {
      message: "Connected to ZenFlow Real-Time Server",
      socketId: socket.id
    });
}

    // Room partitioning by ticketId
    socket.on("join_ticket", (ticketId) => {
      socket.join(ticketId);
      console.log(`Socket ${socket.id} joined ticket room: ${ticketId}`);
    });

    // Handle bidirectional chat messaging
    socket.on("send_message", (data) => {
      console.log(`Chat message received in room ${data.ticketId}:`, data);
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