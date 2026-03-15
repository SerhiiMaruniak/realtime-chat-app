import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const userSocketMap = new Map();

export const getReceiverSocketIds = (userId) => {
  return userSocketMap.get(userId) || [];
};

io.on("connection", (socket) => {
  const userId =
    (socket.handshake &&
      (socket.handshake.query?.userId || socket.handshake.auth?.userId)) ||
    null;
  if (userId) {
    const sockets = userSocketMap.get(userId) || [];
    userSocketMap.set(userId, [...sockets, socket.id]);
  }

  io.emit("getOnlineUsers", Array.from(userSocketMap.keys()));

  socket.on("disconnect", () => {
    if (userId) {
      const sockets = userSocketMap.get(userId) || [];
      const updatedSockets = sockets.filter((id) => id !== socket.id);
      if (updatedSockets.length > 0) {
        userSocketMap.set(userId, updatedSockets);
      } else {
        userSocketMap.delete(userId);
      }
      io.emit("getOnlineUsers", Array.from(userSocketMap.keys()));
    }
  });
});

export { io, app, server };
