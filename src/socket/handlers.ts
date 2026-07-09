import { Server, Socket } from "socket.io";
import { prisma } from "../lib/prisma.js";
import { SOCKET_EVENTS } from "./events.js";
import { getSocketId } from "./presence.js";

export const handleMarkChatRead = async (
  io: Server,
  socket: Socket,
  chatId: string,
) => {
  try {
    const userId = socket.data.user.userId;

    // STEP 1
    // Find unread messages sent by the other user.
    const unreadMessages = await prisma.message.findMany({
      where: {
        chatId,
        senderId: {
          not: userId,
        },
        readAt: null,
      },
      select: {
        id: true,
      },
    });

    console.log("Unread Messages:", unreadMessages);

    if (unreadMessages.length === 0) {
      return;
    }

    // STEP 2
    // Mark them as read.
    const readAt = new Date();

    const result = await prisma.message.updateMany({
      where: {
        chatId,
        senderId: {
          not: userId,
        },
        readAt: null,
      },
      data: {
        readAt,
      },
    });

    console.log("Updated Messages:", result);

    // STEP 3
    // Find the other participant.
    const chat = await prisma.chat.findUnique({
      where: {
        id: chatId,
      },
      include: {
        members: true,
      },
    });

    if (!chat) return;

    const otherMember = chat.members.find(
      (member) => member.userId !== userId,
    );

    if (!otherMember) return;

    // STEP 4
    // Is sender online?
    const senderSocketId = getSocketId(otherMember.userId);

    console.log("Sender Socket:", senderSocketId);

    if (!senderSocketId) return;

    // STEP 5
    // Notify sender.
    io.to(senderSocketId).emit(SOCKET_EVENTS.MESSAGE_READ, {
      chatId,
      readBy: userId,
      readAt,
      messageIds: unreadMessages.map((message) => message.id),
    });

    console.log("✅ Read receipt sent");
  } catch (error) {
    console.error("MARK_CHAT_READ Error:", error);
  }
};