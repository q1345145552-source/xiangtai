import { readFileSync } from "fs";
import { prisma } from "../src/lib/prisma";

async function main() {
  const filePath = process.argv[2];
  const title = process.argv[3] ?? "手动导入文档";
  if (!filePath) {
    throw new Error("请提供文档路径：npm run tsx scripts/import-kb.ts <filePath> <title>");
  }
  const content = readFileSync(filePath, "utf-8");
  await prisma.knowledgeDoc.create({
    data: {
      title,
      content,
      version: "v1",
      isActive: true
    }
  });
  console.log(`导入完成：${title}`);
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
