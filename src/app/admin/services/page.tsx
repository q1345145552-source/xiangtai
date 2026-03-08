import { redirect } from "next/navigation";
import { isAdminAuthed } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { AdminNav } from "@/components/admin-nav";
import { AdminServicesManager } from "@/components/admin-services-manager";

export default async function AdminServicesPage() {
  if (!(await isAdminAuthed())) {
    redirect("/admin");
  }
  const initial = await prisma.servicePage.findMany({
    orderBy: [{ domain: "asc" }, { sortOrder: "asc" }]
  });

  return (
    <div>
      <AdminNav />
      <AdminServicesManager initial={initial} />
    </div>
  );
}
