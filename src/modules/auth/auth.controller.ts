import type { Request, Response, NextFunction } from "express";
import { authService } from "./auth.service.js";
export const authController = {
  async register(req: Request, res: Response) {
    const user = await authService.register(req.body);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: user,
    });
  },
  async login(req: Request, res: Response) {
    const data = await authService.login(req.body);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data,
    });
  },
  async me(req: Request, res: Response) {
    const user = await authService.me(req.user.id);

    res.status(200).json({
      success: true,
      data: user,
    });
  },
};
