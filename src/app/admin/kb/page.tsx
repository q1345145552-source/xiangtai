import { prisma } from "@/lib/prisma";
import { AdminPageWrapper } from "@/components/admin-page-wrapper";
import { AdminKbManager } from "@/components/admin-kb-manager";

export default async function AdminKbPage() {
  const initial = await prisma.knowledgeDoc.findMany({
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, version: true, sourceUrl: true, tags: true }
  });

  return (
    <AdminPageWrapper title="知识库管理" description="上传和管理 AI 咨询的知识库文档。">
      <AdminKbManager initial={initial} />
    </AdminPageWrapper>
  );
}
