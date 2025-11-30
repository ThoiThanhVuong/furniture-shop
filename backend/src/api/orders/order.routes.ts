import { Router } from "express";
import * as orderController from "./order.controller";
import { authenticate, authorize } from "../../middlewares/auth.middleware";
import { body } from "express-validator";
import { validate } from "../../middlewares/validation.middleware";

const router = Router();

router.use(authenticate);

const createOrderValidator = [
  body("paymentMethod")
    .isIn(["COD", "BANK_TRANSFER", "MOMO"])
    .withMessage("Invalid payment method"),

  body("shippingAddress")
    .notEmpty()
    .withMessage("Shipping address is required"),

  body("customerName").notEmpty().withMessage("Customer name is required"),
  body("customerEmail").isEmail().withMessage("Valid email is required"),
  body("customerPhone").notEmpty().withMessage("Phone number is required"),

  // gửi danh sách sản phẩm muốn mua
  body("selectedProductIds")
    .optional()
    .isArray()
    .withMessage("selectedProductIds must be an array"),

  body("selectedProductIds.*")
    .optional()
    .isString()
    .withMessage("Each productId must be a string"),
];

router.post("/", validate(createOrderValidator), orderController.createOrder);
router.get("/my-orders", orderController.getMyOrders);
router.get("/:id", orderController.getOrderById);
router.put("/:id/cancel", orderController.cancelOrder);
router.post("/:id/confirm-payment", orderController.confirmPayment);
router.post("/:id/momo-pay", orderController.createMomoPaymentForOrder);
router.post("/:id/reorder", orderController.reorderToCart);
// Admin auto-cancel các đơn MoMo chờ thanh toán quá lâu
router.post(
  "/auto-cancel-expired-momo",
  authorize("ADMIN"),
  validate([
    body("timeoutMinutes")
      .optional()
      .isInt({ min: 1 })
      .withMessage("timeoutMinutes must be a positive integer"),
  ]),
  orderController.autoCancelExpiredMomo
);
export default router;
