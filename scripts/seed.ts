import { prisma } from "../src/lib/prisma";
import { SERVICE_DOMAINS } from "../src/lib/constants";

async function main() {
  await prisma.adminUser.upsert({
    where: { username: "admin" },
    update: {},
    create: { username: "admin", password: "123456" }
  });

  for (const [idx, item] of SERVICE_DOMAINS.entries()) {
    await prisma.servicePage.upsert({
      where: { slug: item.slug },
      update: {
        title: item.title,
        description: item.description,
        caseText: item.caseText,
        entryName: item.entryName,
        entryUrl: item.entryUrl,
        sortOrder: idx
      },
      create: {
        ...item,
        sortOrder: idx
      }
    });
  }

  const existingPlans = await prisma.solutionPlan.findMany({ select: { title: true } });
  const planTitles = new Set(existingPlans.map((p) => p.title));
  const plans = [
    {
      title: "美妆品牌泰国启动方案",
      industry: "美妆",
      tags: "注册公司,TikTok入驻,海外仓",
      content:
        "阶段1：公司注册+税号办理（预计10-15工作日）\n阶段2：TikTok店铺入驻及基础运营配置\n阶段3：海外仓备货与物流时效SOP建立",
      status: "active"
    },
    {
      title: "食品类合规入泰方案",
      industry: "食品",
      tags: "注册公司,FDA资质,中泰物流",
      content: "阶段1：本地主体搭建\n阶段2：FDA申报材料整理与提交\n阶段3：正报正清与物流通路打通",
      status: "active"
    }
  ];
  for (const p of plans) {
    if (!planTitles.has(p.title)) {
      await prisma.solutionPlan.create({ data: p });
    }
  }

  const existingDocs = await prisma.knowledgeDoc.findMany({ select: { title: true } });
  const docTitles = new Set(existingDocs.map((d) => d.title));
  const docs = [
    {
      title: "泰国公司注册周期参考",
      content: "常规情况下，泰国公司注册流程约为 10-20 个工作日，取决于材料完整度和审批节奏。",
      sourceUrl: "https://example.com/policy/company-register",
      version: "v1",
      isActive: true
    },
    {
      title: "FDA 常见材料清单",
      content: "泰国 FDA 申请通常需要产品说明、配方信息、标签样稿、生产资质与授权材料。",
      sourceUrl: "https://example.com/policy/fda-docs",
      version: "v1",
      isActive: true
    }
  ];
  for (const d of docs) {
    if (!docTitles.has(d.title)) {
      await prisma.knowledgeDoc.create({ data: d });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
