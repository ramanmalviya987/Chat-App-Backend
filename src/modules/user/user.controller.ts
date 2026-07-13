import type { Request, Response } from "express";
import { userService } from "./user.service.js";

export const userController = {
  async getAllUsers(req: Request, res: Response) {
    const users = await userService.getAllUsers(req.user.id);

    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: users,
    });
  },
  async updateAvatar(req: Request, res: Response) {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload an image",
      });
    }

    const user = await userService.updateAvatar(req.user.id, req.file);

    res.status(200).json({
      success: true,
      message: "Avatar uploaded successfully",
      data: user,
    });
  },
};
