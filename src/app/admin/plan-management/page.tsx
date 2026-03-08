import { redirect } from "next/navigation";
import { isAdminAuthed } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { AdminNav } from "@/components/admin-nav";
import { AdminPlanManagement } from "@/components/admin-plan-management";

export default async function AdminPlanManagementPage() {
  if (!(await isAdminAuthed())) {
    redirect("/admin");
  }

  const rows = await prisma.solutionEvaluation.findMany({
    orderBy: { createdAt: "desc" },
    take: 200
  });

  return (
    <div className="space-y-6">
      <AdminNav />

      <section className="panel p-5">
        <h1 className="text-xl font-semibold">方案管理</h1>
        <p className="mt-2 text-sm text-slate-600">展示客户端提交后生成的方案记录，按提交时间倒序排列。</p>
      </section>

      <AdminPlanManagement rows={rows} />
    </div>
  );
}
