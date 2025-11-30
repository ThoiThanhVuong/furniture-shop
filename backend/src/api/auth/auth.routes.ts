import { Router } from "express";
import * as authController from "./auth.controller";
import {
  registerValidator,
  loginValidator,
  resetPasswordRequestValidator,
  resetPasswordValidator,
  changePasswordValidator,
} from "./auth.validators";
import { validate } from "../../middlewares/validation.middleware";
import { authenticate } from "../../middlewares/auth.middleware";
import { authLimiter } from "../../middlewares/rateLimiter.middleware";

const router = Router();

router.post(
  "/register",
  authLimiter,
  validate(registerValidator),
  authController.register
);

router.post(
  "/login",
  authLimiter,
  validate(loginValidator),
  authController.login
);

router.post("/refresh", authController.refreshToken);

router.post(
  "/request-reset",
  authLimiter,
  validate(resetPasswordRequestValidator),
  authController.requestPasswordReset
);

router.post(
  "/reset-password",
  authLimiter,
  validate(resetPasswordValidator),
  authController.resetPassword
);

router.post(
  "/change-password",
  authenticate,
  validate(changePasswordValidator),
  authController.changePassword
);

router.get("/profile", authenticate, authController.getProfile);
router.put("/profile", authenticate, authController.updateProfile);
export default router;
