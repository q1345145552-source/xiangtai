import { createHash } from "crypto";
import { PrismaClient } from "@prisma/client";

const PASSWORD_SALT = process.env.PASSWORD_SALT || "xiangtai-default-salt-2024";
const dbUrl = process.env.DATABASE_URL ?? "file:./prisma/dev.db";

function hashPassword(password: string): string {
  return createHash("sha256").update(PASSWORD_SALT + password).digest("hex");
}

const prisma = new PrismaClient({ datasourceUrl: dbUrl });

async function main() {
  const hashedPassword = hashPassword("123456");
  await prisma.adminUser.upsert({
    where: { username: "admin" },
    update: { password: hashedPassword },
    create: { username: "admin", password: hashedPassword }
  });

  const feeCategories = [
    { name: "入库费", code: "INBOUND" },
    { name: "仓储费", code: "STORAGE" },
    { name: "出库操作费", code: "HANDLING" },
    { name: "尾程配送费", code: "LAST_MILE" },
    { name: "退货处理费", code: "RETURN" },
    { name: "附加服务费", code: "EXTRA" }
  ];
  for (const cat of feeCategories) {
    await prisma.feeCategory.upsert({
      where: { code: cat.code },
      update: {},
      create: cat
    });
  }

  // ... rest of seed logic same as seed.mjs
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
