import { z } from "zod";

export const createDirectChatSchema = z.object({
  receiverId: z.string().trim().min(1, "Receiver ID is required"),
});

export type CreateDirectChatInput = z.infer<
  typeof createDirectChatSchema
>;

export const getChatMessagesSchema = z.object({
  chatId: z.string().trim().min(1, "Chat ID is required"),
});

export type GetChatMessagesInput = z.infer<
  typeof getChatMessagesSchema
>;