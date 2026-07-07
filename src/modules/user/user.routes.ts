import { Router } from "express";
import { userController } from "./user.controller.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = Router();

router.get(
  "/",
  authenticate,
  asyncHandler(userController.getAllUsers)
);

export default router;