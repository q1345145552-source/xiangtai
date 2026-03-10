import { PrismaClient } from "@prisma/client";
import { prepareRuntimeDatabase } from "@/lib/runtime-db";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

prepareRuntimeDatabase();

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
