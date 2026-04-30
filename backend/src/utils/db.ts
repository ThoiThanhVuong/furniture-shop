import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: [
    { level: "query", emit: "event" },
    { level: "error", emit: "stdout" },
    { level: "warn", emit: "stdout" },
  ],
});

// Log queries in development
if (process.env.NODE_ENV === "development") {
  prisma.$on("query", (e: any) => {
    console.log(`Query: ${e.query}`);
    console.log(`Duration: ${e.duration}ms`);
  });
}

// Graceful shutdown
process.on("beforeExit", async () => {
  await prisma.$disconnect();
  console.log("Prisma disconnected");
});

export default prisma;
