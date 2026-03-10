import { redirect } from "next/navigation";
import { isAdminAuthed } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { AdminNav } from "@/components/admin-nav";
import { AdminSolutionsManager } from "@/components/admin-solutions-manager";

export default async function AdminSolutionsPage() {
  if (!(await isAdminAuthed())) {
    redirect("/admin");
  }

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
    <div>
      <AdminNav />
      <AdminSolutionsManager optionPlans={optionPlans} initialBigPlans={bigPlans} />
    </div>
  );
}
