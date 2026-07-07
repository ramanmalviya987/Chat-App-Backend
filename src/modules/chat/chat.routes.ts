import { Router } from "express";
import { chatController } from "./chat.controller.js";
import { createDirectChatSchema } from "./chat.validation.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = Router();

router.post(
  "/direct",
  authenticate,
  validate(createDirectChatSchema),
  asyncHandler(chatController.createDirectChat)
);
router.get(
  "/:chatId/messages",
  authenticate,
  asyncHandler(chatController.getChatMessages)
);

export default router;