export default function initTicketSocket(io) {
  io.on("connection", (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // User joins a ticket room
    socket.on("join_ticket", (ticketId) => {
      socket.join(ticketId);
      console.log(`👤 Socket ${socket.id} joined room: ${ticketId}`);
    });

    // User sends a message in a ticket room
    socket.on("send_message", (data) => {
      console.log(`💬 Message received in ${data.ticketId}:`, data);
      
      // Broadcast to ALL users in that room (including sender)
      io.to(data.ticketId).emit("receive_message", data);
    });

    socket.on("disconnect", () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });
}