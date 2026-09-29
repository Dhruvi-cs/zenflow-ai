const { Server } = require("socket.io");

function initTicketSocket(io) {
    io.on("connection", (socket) => {
        console.log(`Client connected: ${socket.id}`);

        socket.emit("welcome", {
            message: "Connected to ZenFlow Real-Time Server",
            socketId: socket.id
        });

        socket.on("join_ticket", (ticketId) => {
            socket.join(ticketId);
            console.log(`Socket ${socket.id} joined room: ${ticketId}`);
        });

        socket.on("send_message", (data) => {
            console.log(`Message received in ${data.ticketId}:`, data);
            io.to(data.ticketId).emit("receive_message", data);
        });

        socket.on("typing", (data) => {
            socket.to(data.ticketId).emit("user_typing", {
                username: data.username
            });
        });

        socket.on("stop_typing", (data) => {
            socket.to(data.ticketId).emit("user_stopped_typing");
        });

        socket.on("disconnect", () => {
            console.log(`Client disconnected: ${socket.id}`);
        });
    });
}

module.exports = initTicketSocket;
