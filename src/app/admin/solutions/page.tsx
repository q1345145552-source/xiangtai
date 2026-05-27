import { prisma } from "@/lib/prisma";
import { AdminPageWrapper } from "@/components/admin-page-wrapper";
import { AdminSolutionsManager } from "@/components/admin-solutions-manager";

export default async function AdminSolutionsPage() {
  let optionPlans: Awaited<ReturnType<typeof prisma.questionOptionPlan.findMany>> = [];
  let bigPlans: Awaited<ReturnType<typeof prisma.solutionPlan.findMany>> = [];
  try {
    [optionPlans, bigPlans] = await Promise.all([
      prisma.questionOptionPlan.findMany({
        orderBy: [{ questionNo: "asc" }, { answerCode: "asc" }]
      }),
      prisma.solutionPlan.findMany({
        where: { industry: "问卷大方案" },
        orderBy: { createdAt: "desc" },
        take: 100
      })
    ]);
  } catch {
    optionPlans = [];
    bigPlans = [];
  }

  return (
    <AdminPageWrapper title="方案库" description="配置问卷选项与小方案内容，保存后自动生成大方案快照。">
      <AdminSolutionsManager optionPlans={optionPlans} initialBigPlans={bigPlans} />
    </AdminPageWrapper>
  );
}
