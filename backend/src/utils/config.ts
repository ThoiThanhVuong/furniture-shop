import dotenv from "dotenv";

dotenv.config();

export const config = {
  env: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "3000", 10),
  apiPrefix: process.env.API_PREFIX || "/api/v1",

  database: {
    url: process.env.DATABASE_URL!,
  },

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET!,
    refreshSecret: process.env.JWT_REFRESH_SECRET!,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "45m",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  },

  email: {
    host: process.env.SMTP_HOST!,
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER!,
      pass: process.env.SMTP_PASS!,
    },
    from: process.env.EMAIL_FROM!,
  },

  frontend: {
    url: process.env.FRONTEND_URL || "http://localhost:3001",
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "600000", 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "10000", 10),
  },

  security: {
    maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS || "3", 10),
    lockTimeMinutes: parseInt(process.env.LOCK_TIME_MINUTES || "15", 10),
    csrfSecret: process.env.CSRF_SECRET!,
  },

  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || "5242880", 10),
    uploadPath: process.env.UPLOAD_PATH || "./uploads",
  },

  momo: {
    partnerCode: process.env.MOMO_PARTNER_CODE || "",
    accessKey: process.env.MOMO_ACCESS_KEY || "",
    secretKey: process.env.MOMO_SECRET_KEY || "",
    endpoint:
      process.env.MOMO_ENDPOINT ||
      "https://test-payment.momo.vn/v2/gateway/api/create",
    redirectUrl:
      process.env.MOMO_REDIRECT_URL ||
      `${process.env.FRONTEND_URL || "http://localhost:3001"}/payment/momo/return`,
    ipnUrl:
      process.env.MOMO_IPN_URL ||
      `http://localhost:${process.env.PORT || "3000"}${
        process.env.API_PREFIX || "/api/v1"
      }/payments/momo/ipn`,
  },
};

// // Validate required environment variables
// const requiredEnvVars = [
//   "DATABASE_URL",
//   "JWT_ACCESS_SECRET",
//   "JWT_REFRESH_SECRET",
//   "SMTP_HOST",
//   "SMTP_USER",
//   "SMTP_PASS",
// ];

// requiredEnvVars.forEach((varName) => {
//   if (!process.env[varName]) {
//     throw new Error(`Missing required environment variable: ${varName}`);
//   }
// });
