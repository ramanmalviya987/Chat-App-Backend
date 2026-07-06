import { Router } from "express";
import { authController } from "./auth.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { loginSchema, registerSchema } from "./auth.validation.js";
import { asyncHandler } from "../../utils/async-handler.js";

const router = Router();

router.post("/register", validate(registerSchema),   asyncHandler(authController.register)
);
router.post(
  "/login",
  validate(loginSchema),
  asyncHandler(authController.login)
);

export default router;
