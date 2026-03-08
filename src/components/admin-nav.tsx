import Link from "next/link";

export function AdminNav() {
  return (
    <nav className="mb-6 flex flex-wrap gap-3 text-sm">
      <Link href="/admin/solutions" className="btn-secondary">
        方案库
      </Link>
      <Link href="/admin/plan-management" className="btn-secondary">
        方案管理
      </Link>
      <Link href="/admin/evaluation-codes" className="btn-secondary">
        评估码生成器
      </Link>
      <Link href="/admin/services" className="btn-secondary">
        业务内容
      </Link>
      <Link href="/admin/kb" className="btn-secondary">
        知识库
      </Link>
    </nav>
  );
}
