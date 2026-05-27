import { createHash } from "crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const PASSWORD_SALT = process.env.PASSWORD_SALT || "xiangtai-default-salt-2024";

function hashPassword(password) {
  return createHash("sha256").update(PASSWORD_SALT + password).digest("hex");
}

const serviceDomains = [
  {
    domain: "government",
    slug: "business-registration",
    title: "工商注册",
    description: "泰国公司注册、董事架构设计、材料准备与全流程代办。",
    caseText: "案例：美妆品牌 12 个工作日完成注册并获批税号。",
    entryName: "湘泰工商系统登录入口",
    entryUrl: "https://example.com/ic-system"
  },
  {
    domain: "government",
    slug: "tax-services",
    title: "税务办理",
    description: "税务登记、申报合规、税务筹划咨询。",
    caseText: "案例：跨境卖家完成季度税务合规改造，申报准确率提升。",
    entryName: "税务办理系统登录入口",
    entryUrl: "https://example.com/tax-system"
  },
  {
    domain: "qualification",
    slug: "product-qualification",
    title: "产品资质",
    description: "FDA、DLD 等资质办理咨询与材料提交服务。",
    caseText: "案例：食品类产品 21 天完成 FDA 材料受理。",
    entryName: "产品资质系统登录入口",
    entryUrl: "https://example.com/qualification-system"
  },
  {
    domain: "logistics",
    slug: "overseas-warehouse",
    title: "海外仓入仓",
    description: "提供备货策略、入仓标准、库内运营与库存周转建议。",
    caseText: "案例：某店铺库存周转天数由 45 天降至 23 天。",
    entryName: "海外仓系统入口",
    entryUrl: "https://example.com/warehouse-system"
  },
  {
    domain: "logistics",
    slug: "logistics-cooperation",
    title: "物流合作",
    description: "中泰干线、末端配送、逆向物流与时效追踪服务。",
    caseText: "案例：旺季期间签收时效稳定在 3-5 天。",
    entryName: "物流系统登录入口",
    entryUrl: "https://example.com/logistics-system"
  },
  {
    domain: "logistics",
    slug: "customs-clearance",
    title: "正报正清",
    description: "正规报关与清关方案设计，降低通关风险。",
    caseText: "案例：清关异常率下降 60%，货损投诉显著降低。",
    entryName: "正清系统登录入口",
    entryUrl: "https://example.com/customs-system"
  },
  {
    domain: "ecommerce",
    slug: "shop-entry",
    title: "店铺入驻",
    description: "Shopee / TikTok 等平台入驻价格与服务包说明。",
    caseText: "案例：客户 7 天完成平台开店并上线首批商品。",
    entryName: "联系客服下单",
    entryUrl: "https://example.com/contact-sales"
  }
];

async function main() {
  // Seed admin with hashed password
  const hashedPassword = hashPassword("123456");
  await prisma.adminUser.upsert({
    where: { username: "admin" },
    update: { password: hashedPassword },
    create: { username: "admin", password: hashedPassword }
  });

  // Seed default fee categories
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

  for (const [idx, item] of serviceDomains.entries()) {
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
      create: { ...item, sortOrder: idx }
    });
  }

  const planTitles = new Set((await prisma.solutionPlan.findMany({ select: { title: true } })).map((p) => p.title));
  const plans = [
    {
      title: "美妆品牌泰国启动方案",
      industry: "美妆",
      tags: "注册公司,TikTok入驻,海外仓",
      content: "阶段1：公司注册+税号办理（预计10-15工作日）\n阶段2：TikTok店铺入驻及基础运营配置\n阶段3：海外仓备货与物流时效SOP建立",
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
    if (!planTitles.has(p.title)) await prisma.solutionPlan.create({ data: p });
  }

  const docTitles = new Set((await prisma.knowledgeDoc.findMany({ select: { title: true } })).map((d) => d.title));
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
    if (!docTitles.has(d.title)) await prisma.knowledgeDoc.create({ data: d });
  }

  const codeCount = await prisma.evaluationAccessCode.count();
  if (codeCount === 0) {
    await prisma.evaluationAccessCode.createMany({
      data: [{ code: "EVA-DEMO-1001" }, { code: "EVA-DEMO-1002" }, { code: "EVA-DEMO-1003" }]
    });
  }
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
