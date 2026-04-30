import express, { Application } from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { config } from "./utils/config";

import { errorHandler, notFoundHandler } from "./middlewares/error.middleware";
import { generalLimiter } from "./middlewares/rateLimiter.middleware";
import { OrderService } from "./api/orders/order.service";
// Import routes
import authRoutes from "./api/auth/auth.routes";
import productRoutes from "./api/products/product.routes";
import categoryRoutes from "./api/categories/category.routes";
import cartRoutes from "./api/carts/cart.routes";
import orderRoutes from "./api/orders/order.routes";
import voucherRoutes from "./api/vouchers/voucher.routes";
import contactRoutes from "./api/contacts/contact.routes";
import adminRoutes from "./api/admin/admin.routes";
import path from "path";
import momoRoutes from "./api/payments/momo.routes";
import shopRoutes from "./api/shop/shop.routes";

const app: Application = express();
app.use("/images", express.static(path.join(__dirname, "public", "images")));
// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: config.frontend.url,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Compression
app.use(compression());

// Body parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Cookie parser
app.use(cookieParser());

// Logging
if (config.env === "development") {
  app.use(morgan("dev"));
} else {
  app.use(
    morgan("combined", {
      stream: {
        write: (message) => console.log(message.trim()),
      },
    })
  );
}

// Rate limiting
app.use(generalLimiter);

// Health check
app.get("/health", (_req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes
const apiPrefix = config.apiPrefix;

app.use(`${apiPrefix}/auth`, authRoutes);
app.use(`${apiPrefix}/products`, productRoutes);
app.use(`${apiPrefix}/categories`, categoryRoutes);
app.use(`${apiPrefix}/cart`, cartRoutes);
app.use(`${apiPrefix}/orders`, orderRoutes);
app.use(`${apiPrefix}/shop`, shopRoutes);
app.use(`${apiPrefix}/vouchers`, voucherRoutes);
app.use(`${apiPrefix}/contacts`, contactRoutes);
app.use(`${apiPrefix}/admin`, adminRoutes);
// MoMo IPN + các route payment khác
app.use(`${apiPrefix}/payments/momo`, momoRoutes);
// ================== Auto-cancel MoMo orders ==================
if (config.env !== "test") {
  const orderService = new OrderService();
  const AUTO_CANCEL_INTERVAL_MS = 5 * 60 * 1000; // 5 phút

  setInterval(async () => {
    try {
      const result = await orderService.cancelExpiredUnpaidMomoOrders(30); // timeout 30 phút

      if (result.cancelledCount > 0) {
        console.log(
          `[AutoCancelMoMo] Cancelled ${result.cancelledCount} orders (timeout ${result.timeoutMinutes}m)`
        );
      }
    } catch (err) {
      console.error("[AutoCancelMoMo] Error:", err);
    }
  }, AUTO_CANCEL_INTERVAL_MS);
}

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
