import { Server } from "socket.io";
import { SOCKET_EVENTS } from "./events.js";
import {
  addOnlineUser,
  removeOnlineUser,
  getOnlineUsers,
  getSocketId,
} from "./presence.js";
import { prisma } from "../lib/prisma.js";
import { handleMarkChatRead } from "./handlers.js";

export const registerSocketHandlers = (io: Server) => {
  io.on("connection", (socket) => {
    console.log("✅ Connected:", socket.id);

    const userId = socket.data.user.userId;

    // Save socket id for this user.
    addOnlineUser(userId, socket.id);

    // Notify everyone.
    io.emit(SOCKET_EVENTS.ONLINE_USERS, getOnlineUsers());
    io.emit(SOCKET_EVENTS.USER_ONLINE, userId);

    // Read Receipts
    socket.on(SOCKET_EVENTS.MARK_CHAT_READ, ({ chatId }) => {
      handleMarkChatRead(io, socket, chatId);
    });

    // Typing Start
    socket.on(SOCKET_EVENTS.TYPING_START, (chatId: string) => {
      console.log(`⌨️ TYPING_START from ${userId} in chat ${chatId}`);

      socket.to(chatId).emit(SOCKET_EVENTS.TYPING_START, {
        userId,
      });
    });
    // Typing Stop

    socket.on(SOCKET_EVENTS.TYPING_STOP, (chatId: string) => {
      console.log(`🛑 TYPING_STOP from ${userId} in chat ${chatId}`);

      socket.to(chatId).emit(SOCKET_EVENTS.TYPING_STOP, {
        userId,
      });
    });

    // Frontend requests current online users
    socket.on(SOCKET_EVENTS.GET_ONLINE_USERS, () => {
      socket.emit(SOCKET_EVENTS.ONLINE_USERS, getOnlineUsers());
    });

    // Join Chat Room
    socket.on(SOCKET_EVENTS.JOIN_CHAT, (chatId: string) => {
      socket.join(chatId);

      console.log(`👤 User ${userId} joined chat ${chatId}`);
    });

    // Leave Chat Room
    socket.on(SOCKET_EVENTS.LEAVE_CHAT, (chatId: string) => {
      socket.leave(chatId);

      console.log(`👤 User ${userId} left chat ${chatId}`);
    });

    //  Disconnect
    socket.on("disconnect", () => {
      removeOnlineUser(userId);
      io.emit(SOCKET_EVENTS.ONLINE_USERS, getOnlineUsers());
      io.emit(SOCKET_EVENTS.USER_OFFLINE, userId);
      console.log(`❌ Disconnected: ${socket.id}`);
    });
  });
};
