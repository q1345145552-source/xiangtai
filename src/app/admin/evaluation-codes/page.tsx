import { AdminPageWrapper } from "@/components/admin-page-wrapper";
import { AdminEvaluationCodesManager } from "@/components/admin-evaluation-codes-manager";

export default async function AdminEvaluationCodesPage() {
  return (
    <AdminPageWrapper title="评估码生成器" description="批量生成一次性评估码，供客户填写问卷使用。">
      <AdminEvaluationCodesManager />
    </AdminPageWrapper>
  );
}
