import { Router } from "express";
import { userController } from "./user.controller.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { upload } from "../../middlewares/upload.middleware.js";

const router = Router();

router.get("/", authenticate, asyncHandler(userController.getAllUsers));

router.patch("/avatar", authenticate, upload.single("avatar"),   asyncHandler(userController.updateAvatar));

export default router;
