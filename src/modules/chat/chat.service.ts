import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../errors/app-error.js";
import { generateId } from "../../utils/id.js";
import type { CreateDirectChatInput } from "./chat.validation.js";
import { Prisma } from "../../generated/prisma/client.js";

export const chatService = {
  async createDirectChat(
    currentUserId: string,
    data: CreateDirectChatInput
  ) {
    const { receiverId } = data;
   
    // Step 1: User cannot start a chat with themselves
   
    if (currentUserId === receiverId) {
      throw new AppError(400, "You cannot chat with yourself.");
    }
    // Step 2: Check if receiver exists
    const receiver = await prisma.user.findUnique({
      where: {
        id: receiverId,
      },
      select: {
        id: true,
      },
    });

    if (!receiver) {
      throw new AppError(404, "Receiver not found.");
    }

    // Step 3: Generate a unique direct key
    //
    // A -> B  => A_B
    // B -> A  => A_B
    //
    // Sorting guarantees both users generate
    // the exact same key.
    const directKey = [currentUserId, receiverId].sort().join("_");

    try {
      // Step 4:
      // Create everything inside ONE transaction.
      // If any query fails,
      // everything will rollback.

      const chat = await prisma.$transaction(async (tx) => {
        // Create Chat
        const newChat = await tx.chat.create({
          data: {
            id: generateId(),
            type: "DIRECT",
            directKey,
          },
        });

        // Add logged in user
        await tx.chatMember.create({
          data: {
            id: generateId(),
            chatId: newChat.id,
            userId: currentUserId,
          },
        });

        // Add receiver
        await tx.chatMember.create({
          data: {
            id: generateId(),
            chatId: newChat.id,
            userId: receiverId,
          },
        });

        return newChat;
      });

      return chat;
    } catch (error) {
      // Step 5:
      // Handle race condition.
      //
      // If two users create the chat simultaneously,
      // PostgreSQL will allow only ONE insert because
      // directKey is UNIQUE.
      //
      // The second request gets Prisma error P2002.
      //
      // Instead of returning an error,
      // fetch the already-created chat.

      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        const existingChat = await prisma.chat.findUnique({
          where: {
            directKey,
          },
        });

        if (existingChat) {
          return existingChat;
        }
      }

      throw error;
    }
  },

// Get all messages of a chat
async getChatMessages(currentUserId: string, chatId: string) {
  // Step 1:
  // Check whether the chat exists
  const chat = await prisma.chat.findUnique({
    where: {
      id: chatId,
    },
    select: {
      id: true,
    },
  });

  if (!chat) {
    throw new AppError(404, "Chat not found.");
  }

  // Step 2:
  // Verify the logged-in user belongs to this chat.
  // This prevents unauthorized users from reading messages.
  const isMember = await prisma.chatMember.findUnique({
    where: {
      chatId_userId: {
        chatId,
        userId: currentUserId,
      },
    },
  });

  if (!isMember) {
    throw new AppError(
      403,
      "You are not authorized to access this chat."
    );
  }

  // Step 3:
  // Fetch all messages ordered from oldest to newest.
  // Also return sender information so the frontend
  // can display the sender name without another API call.
  
  const messages = await prisma.message.findMany({
    where: {
      chatId,
    },
    orderBy: {
      createdAt: "asc",
    },
    select: {
      id: true,
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

  return messages;
},
};