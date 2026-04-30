import app from "./app";
import { config } from "./utils/config";
import prisma from "./utils/db";

const PORT = config.port;

// Database connection check
async function checkDatabaseConnection() {
  try {
    await prisma.$connect();
    console.log("✅ Database connected successfully");
  } catch (error) {
    console.log("❌ Database connection failed:", error);
    process.exit(1);
  }
}

// Start server
async function startServer() {
  try {
    await checkDatabaseConnection();

    const server = app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════╗
║   🚀 Server is running                 ║
║   📍 Port: ${PORT}                       ║
║   🌍 Environment: ${config.env}        ║
║   🔗 API: http://localhost:${PORT}${config.apiPrefix}  ║
╚════════════════════════════════════════╝
      `);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      console.log(`${signal} received. Starting graceful shutdown...`);

      server.close(async () => {
        console.log("HTTP server closed");

        try {
          await prisma.$disconnect();
          console.log("Database connection closed");
          process.exit(0);
        } catch (error) {
          console.log("Error during shutdown:", error);
          process.exit(1);
        }
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.log("Forced shutdown after timeout");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  } catch (error) {
    console.log("Failed to start server:", error);
    process.exit(1);
  }
}

// Handle unhandled rejections
process.on("unhandledRejection", (reason, promise) => {
  console.log("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.log("Uncaught Exception:", error);
  process.exit(1);
});

startServer();
