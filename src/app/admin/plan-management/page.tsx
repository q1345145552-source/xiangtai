import { prisma } from "@/lib/prisma";
import { AdminPageWrapper } from "@/components/admin-page-wrapper";
import { AdminPlanManagement } from "@/components/admin-plan-management";

export default async function AdminPlanManagementPage() {
  const rows = await prisma.solutionEvaluation.findMany({
    orderBy: { createdAt: "desc" },
    take: 200
  });

  return (
    <AdminPageWrapper title="方案管理" description="展示客户端提交后生成的方案记录，按提交时间倒序排列。">
      <AdminPlanManagement rows={rows} />
    </AdminPageWrapper>
  );
}
