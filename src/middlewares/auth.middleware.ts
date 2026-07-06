import type { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/app-error.js";
import { verifyToken } from "../utils/jwt.js";
import type { TokenPayload } from "../types/auth.types.js";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    throw new AppError(401, "Authentication reruired");
  }
  if (!authHeader.startsWith("Bearer ")) {
    throw new AppError(401, "Invalid authorization header");
  }
  const token = authHeader.split(" ")[1];

  const payload = verifyToken(token!) as TokenPayload;
  req.user = {
    id: payload.userId,
  };

  next();
};
