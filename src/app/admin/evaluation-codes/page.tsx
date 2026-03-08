import { redirect } from "next/navigation";
import { isAdminAuthed } from "@/lib/admin-auth";
import { AdminNav } from "@/components/admin-nav";
import { AdminEvaluationCodesManager } from "@/components/admin-evaluation-codes-manager";

export default async function AdminEvaluationCodesPage() {
  if (!(await isAdminAuthed())) {
    redirect("/admin");
  }

  return (
    <div>
      <AdminNav />
      <AdminEvaluationCodesManager />
    </div>
  );
}
