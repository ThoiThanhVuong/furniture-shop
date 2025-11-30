import { Router } from "express";
import * as adminController from "./admin.controller";
import { authenticate, authorize } from "../../middlewares/auth.middleware";
import { auditLog } from "../../middlewares/audit.middleware";

const router = Router();

// All admin routes require authentication and ADMIN role
router.use(authenticate);
router.use(authorize("ADMIN"));

// Dashboard
router.get("/dashboard", adminController.getDashboard);
router.get("/dashboard/top-products", adminController.getTopSellingProducts);
router.get("/dashboard/top-customers", adminController.getTopCustomers);
router.get("/dashboard/revenue-trend", adminController.getRevenueTrend);

// Orders management
router.get("/orders", adminController.getAllOrders);
router.get("/orders/:id", adminController.getOrderById);
router.put(
  "/orders/:id/status",
  auditLog("UPDATE_ORDER_STATUS", "Order"),
  adminController.updateOrderStatus
);

// Users management
router.get("/users", adminController.getAllUsers);
router.put(
  "/users/:id/status",
  auditLog("UPDATE_USER_STATUS", "User"),
  adminController.updateUserStatus
);

export default router;
