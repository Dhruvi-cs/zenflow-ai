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

        // Welcome message
        socket.emit("welcome", {
            message: "Connected to ZenFlow Real-Time Server",
            socketId: socket.id
        });

        // Join ticket room
        socket.on("join_ticket", (ticketId) => {

            socket.join(ticketId);

            console.log(
                `👤 Socket ${socket.id} joined room: ${ticketId}`
            );

        });

        // Receive customer/agent message
        socket.on("send_message", (data) => {

            console.log(
                `💬 Message received in ${data.ticketId}:`,
                data
            );

            // Send message to everyone in the ticket room
            io.to(data.ticketId).emit(
                "receive_message",
                data
            );

        });

        // Typing indicator
        socket.on("typing", (data) => {

            socket.to(data.ticketId).emit(
                "user_typing",
                {
                    username: data.username
                }
            );

        });

        // Stop typing indicator
        socket.on("stop_typing", (data) => {

            socket.to(data.ticketId).emit(
                "user_stopped_typing"
            );

        });

        // Disconnect
        socket.on("disconnect", () => {

            console.log(
                `❌ [Socket.io] Client disconnected: ${socket.id}`
            );

        });

    });

    return io;
}

export default initSockets;
