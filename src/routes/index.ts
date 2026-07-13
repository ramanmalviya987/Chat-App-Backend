import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes.js";
import userRoutes from "../modules/user/user.routes.js";
import chatRoutes from "../modules/chat/chat.routes.js";
import messageRoutes from "../modules/message/message.routes.js";

const router = Router();

router.use("/auth", authRoutes);

router.use("/users", userRoutes);
router.use("/chats", chatRoutes);
router.use("/messages", messageRoutes);

export default router;
