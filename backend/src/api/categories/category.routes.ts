import { Router } from "express";
import * as categoryController from "./category.controller";
import { authenticate, authorize } from "../../middlewares/auth.middleware";
import { uploadProductImage } from "../../middlewares/upload";

const router = Router();

// Public routes
router.get("/", categoryController.getAll);
router.get("/:id", categoryController.getById);

// Admin routes
router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  uploadProductImage.single("image"),
  categoryController.create
);
router.put(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  uploadProductImage.single("image"),
  categoryController.update
);
router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  categoryController.remove
);

export default router;
