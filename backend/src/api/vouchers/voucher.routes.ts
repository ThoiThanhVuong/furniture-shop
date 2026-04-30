import { Router } from "express";
import * as voucherController from "./voucher.controller";
import { authenticate, authorize } from "../../middlewares/auth.middleware";

const router = Router();

// Public route
router.post("/validate", authenticate, voucherController.validateVoucher);
router.get("/available", authenticate, voucherController.getAvailable);
// Admin routes
router.get("/", authenticate, authorize("ADMIN"), voucherController.getAll);
router.post("/", authenticate, authorize("ADMIN"), voucherController.create);
router.put("/:id", authenticate, authorize("ADMIN"), voucherController.update);
router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  voucherController.remove
);

export default router;
