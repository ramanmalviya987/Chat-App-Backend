import type { Request, Response } from "express";
import { chatService } from "./chat.service.js";
import type { CreateDirectChatInput } from "./chat.validation.js";

export const chatController = {
  async createDirectChat(req: Request, res: Response) {
    const chat = await chatService.createDirectChat(
      req.user.id,
      req.body as CreateDirectChatInput
    );

    res.status(201).json({
      success: true,
      message: "Direct chat created successfully.",
      data: chat,
    });
  },
  async getChatMessages(req: Request, res: Response) {
  const messages = await chatService.getChatMessages(
    req.user.id,
    req.params.chatId as any,
    req.query.cursor as string | undefined,
    Number(req.query.limit) || 30


    
  );

  res.status(200).json({
    success: true,
    message: "Messages fetched successfully.",
    data: messages,
  });
},
};