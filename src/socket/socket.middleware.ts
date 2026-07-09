import { Socket } from "socket.io";
import jwt from "jsonwebtoken";

interface JwtPayload {
  userId: string;
  email: string;
}

export const socketAuthMiddleware = (
  socket: Socket,
  next: (err?: Error) => void,
) => {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("Unauthorized"));
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!,
    ) as JwtPayload;

    socket.data.user = decoded;

    next();
  } catch (error) {
    next(new Error("Unauthorized"));
  }
};