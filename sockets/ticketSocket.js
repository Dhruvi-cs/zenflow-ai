// In-memory room tracking: { ticketId: { socketId: { sender, status } } }
const roomUsers = {};

export default function initTicketSocket(io) {
  io.on("connection", (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // User joins a ticket room with their username
    socket.on("join_ticket", ({ ticketId, username }) => {
      socket.join(ticketId);
      socket.ticketId = ticketId;
      socket.username = username;

      // Track user in room memory
      if (!roomUsers[ticketId]) {
        roomUsers[ticketId] = {};
      }
      roomUsers[ticketId][socket.id] = { sender: username, status: "Active" };

      console.log(`👤 ${username} (${socket.id}) joined room: ${ticketId}`);

      // Broadcast active user list to all users in this ticket room
      io.to(ticketId).emit("presence_update", Object.values(roomUsers[ticketId]));
    });

    // User sends a message
    socket.on("send_message", (data) => {
      io.to(data.ticketId).emit("receive_message", data);
    });

    // Handle typing status
    socket.on("typing", ({ ticketId, username, isTyping }) => {
      socket.to(ticketId).emit("user_typing", { username, isTyping });
    });

    // Handle status change (Active vs Away)
    socket.on("update_status", ({ ticketId, status }) => {
      if (roomUsers[ticketId] && roomUsers[ticketId][socket.id]) {
        roomUsers[ticketId][socket.id].status = status;
        io.to(ticketId).emit("presence_update", Object.values(roomUsers[ticketId]));
      }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      const { ticketId } = socket;
      if (ticketId && roomUsers[ticketId]) {
        delete roomUsers[ticketId][socket.id];
        
        // Notify remaining users in room
        io.to(ticketId).emit("presence_update", Object.values(roomUsers[ticketId]));

        if (Object.keys(roomUsers[ticketId]).length === 0) {
          delete roomUsers[ticketId];
        }
      }
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });
}