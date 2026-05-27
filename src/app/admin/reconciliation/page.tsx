import { AdminPageWrapper } from "@/components/admin-page-wrapper";
import { AdminReconciliationManager } from "@/components/admin-reconciliation-manager";

export default async function AdminReconciliationPage() {
  return (
    <AdminPageWrapper
      title="海外仓财务勾兑"
      description="管理海外仓财务对账批次，导入对账数据，标记差异，完成勾兑确认。"
    >
      <AdminReconciliationManager />
    </AdminPageWrapper>
  );
}
