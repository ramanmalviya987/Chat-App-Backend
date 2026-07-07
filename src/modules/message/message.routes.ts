import { Router } from "express";
import { messageController } from "./message.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { sendMessageSchema } from "./message.validation.js";

const router = Router();

router.post(
  "/",
  authenticate,
  validate(sendMessageSchema),
  asyncHandler(messageController.sendMessage)
);

export default router;