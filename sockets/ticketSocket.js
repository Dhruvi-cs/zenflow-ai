module.exports = function initTicketSocket(io) {
  io.on("connection", (socket) => {
    console.log(`🔌 [Socket.io] Client connected: ${socket.id}`);

    // Welcome message on connection
    socket.emit("welcome", {
      message: "Connected to ZenFlow Real-Time Server",
      socketId: socket.id
    });

    // 1. User joins a ticket room
    socket.on("join_ticket", (ticketId) => {
      socket.join(ticketId);
      console.log(`👤 Socket ${socket.id} joined room: ${ticketId}`);
    });

    // 2. User sends a message in a ticket room
    socket.on("send_message", (data) => {
      console.log(`💬 Message received in ${data.ticketId}:`, data);
      
      // Broadcast to ALL users in that room (including sender)
      io.to(data.ticketId).emit("receive_message", data);
    });

    // 3. Typing Indicators
    socket.on("typing", (data) => {
      socket.to(data.ticketId).emit("user_typing", {
        username: data.username
      });
    });

    socket.on("stop_typing", (data) => {
      socket.to(data.ticketId).emit("user_stopped_typing");
    });

    socket.on("disconnect", () => {
      console.log(`❌ [Socket.io] Client disconnected: ${socket.id}`);
    });
  });
};