import { prisma } from "@/lib/prisma";
import { AdminPageWrapper } from "@/components/admin-page-wrapper";
import { AdminServicesManager } from "@/components/admin-services-manager";

export default async function AdminServicesPage() {
  const initial = await prisma.servicePage.findMany({
    orderBy: [{ domain: "asc" }, { sortOrder: "asc" }]
  });

  return (
    <AdminPageWrapper title="业务内容维护" description="管理各业务板块的服务内容、案例和入口链接。">
      <AdminServicesManager initial={initial} />
    </AdminPageWrapper>
  );
}
