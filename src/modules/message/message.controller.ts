import type { Request, Response } from "express";
import { messageService } from "./message.service.js";
import type { SendMessageInput } from "./message.validation.js";

export const messageController = {
  async sendMessage(req: Request, res: Response) {
    const message = await messageService.sendMessage(
      req.user.id,
      req.body as SendMessageInput
    );

    res.status(201).json({
      success: true,
      message: "Message sent successfully.",
      data: message,
    });
  },
};