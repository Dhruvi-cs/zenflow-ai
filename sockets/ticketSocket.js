import { Server } from "socket.io";

function initSockets(server) {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log(`⚡ [Socket.io] Client connected: ${socket.id}`);

    socket.emit("welcome", {
      message: "Connected to ZenFlow Real-Time Server",
      socketId: socket.id
    });

    socket.on("disconnect", () => {
      console.log(`❌ [Socket.io] Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

export default initSockets;