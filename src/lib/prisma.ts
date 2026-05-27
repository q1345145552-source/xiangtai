import { PrismaClient } from "@prisma/client";
import { prepareRuntimeDatabase } from "@/lib/runtime-db";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

prepareRuntimeDatabase();

function createPrismaClient() {
  const dbUrl = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
  return new PrismaClient({
    datasourceUrl: dbUrl
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
