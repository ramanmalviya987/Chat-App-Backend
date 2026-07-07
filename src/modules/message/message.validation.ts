import { z } from "zod";

export const sendMessageSchema = z.object({
  chatId: z.string().trim().min(1, "Chat ID is required"),
  content: z
    .string()
    .trim()
    .min(1, "Message cannot be empty")
    .max(5000, "Message is too long"),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;