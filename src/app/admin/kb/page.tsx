import { redirect } from "next/navigation";
import { isAdminAuthed } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { AdminNav } from "@/components/admin-nav";
import { AdminKbManager } from "@/components/admin-kb-manager";

export default async function AdminKbPage() {
  if (!(await isAdminAuthed())) {
    redirect("/admin");
  }
  const initial = await prisma.knowledgeDoc.findMany({
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, version: true, sourceUrl: true, tags: true }
  });

  return (
    <div>
      <AdminNav />
      <AdminKbManager initial={initial} />
    </div>
  );
}
