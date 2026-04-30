import { Router } from "express";
import * as productController from "./product.controller";
import { authenticate, authorize } from "../../middlewares/auth.middleware";
import { uploadProductImage } from "../../middlewares/upload";

const router = Router();

// Public routes
router.get("/", productController.getAll);
router.get("/featured", productController.getFeatured);
router.get("/sale", productController.getSaleProducts);
router.get("/:id", productController.getById);
router.get("/slug/:slug", productController.getBySlug);
router.get("/:id/related", productController.getRelated);

// Admin routes
router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  uploadProductImage.single("image"),
  productController.create
);

router.put(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  uploadProductImage.single("image"),
  productController.update
);

router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  productController.remove
);
// Bulk sale
router.post(
  "/admin/apply-sale-category",
  authenticate,
  authorize("ADMIN"),

  productController.applySaleToCategory
);
router.post(
  "/admin/clear-sale-category",
  authenticate,
  authorize("ADMIN"),
  productController.clearSaleByCategory
);
export default router;
