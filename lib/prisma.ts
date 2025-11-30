import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

// Configure Neon for WebSocket (required for serverless)
neonConfig.webSocketConstructor = ws;

const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
  pool: Pool;
};

// Create connection pool with optimized settings for serverless
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

// Initialize pool with connection limits suitable for serverless
const pool = globalForPrisma.pool || new Pool({ connectionString });
const adapter = new PrismaNeon({ connectionString });

// Create Prisma Client with Neon adapter
const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.pool = pool;
}

export default prisma;