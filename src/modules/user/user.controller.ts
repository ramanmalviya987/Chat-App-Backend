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
};