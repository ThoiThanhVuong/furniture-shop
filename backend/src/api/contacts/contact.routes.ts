import { Router } from "express";
import * as contactController from "./contact.controller";
import { authenticate, authorize } from "../../middlewares/auth.middleware";
import { body } from "express-validator";
import { validate } from "../../middlewares/validation.middleware";

const router = Router();

const createContactValidator = [
  body("name").notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("subject").notEmpty().withMessage("Subject is required"),
  body("message").notEmpty().withMessage("Message is required"),
];

// Public route
router.post("/", validate(createContactValidator), contactController.create);

// Admin routes
router.get("/", authenticate, authorize("ADMIN"), contactController.getAll);
router.get("/:id", authenticate, authorize("ADMIN"), contactController.getById);
router.post(
  "/:id/reply",
  authenticate,
  authorize("ADMIN"),
  contactController.reply
);
router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  contactController.remove
);

export default router;
