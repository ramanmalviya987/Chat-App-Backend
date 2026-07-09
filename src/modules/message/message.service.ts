import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../errors/app-error.js";
import { generateId } from "../../utils/id.js";
import type { SendMessageInput } from "./message.validation.js";
import { getIO } from "../../socket/socket.js";
import { SOCKET_EVENTS } from "../../socket/events.js";

export const messageService = {
  async sendMessage(currentUserId: string, data: SendMessageInput) {
    const { chatId, content } = data;

    // Check whether the current user belongs to this chat.
    // If not, either the chat doesn't exist or the user
    // is not allowed to send messages.

    const member = await prisma.chatMember.findUnique({
      where: {
        chatId_userId: {
          chatId,
          userId: currentUserId,
        },
      },
    });

    if (!member) {
      throw new AppError(404, "Chat not found.");
    }
    // Create the message
    const message = await prisma.message.create({
      data: {
        id: generateId(),
        chatId,
        senderId: currentUserId,
        content,
      },
      select: {
        id: true,
        chatId: true,
        content: true,
        createdAt: true,

        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    const io = getIO();

    io.to(chatId).emit(SOCKET_EVENTS.NEW_MESSAGE, message);

    return message;
  },
};
