"use client";

import { useMemo, useState } from "react";

type PlanRecord = {
  id: string;
  evaluationCode: string;
  customerName: string;
  customerCompany: string;
  customerPhone: string;
  customerEmail: string;
  mallNeed: string;
  productType: string;
  logisticsType: string;
  qualificationFinalCode: string;
  visaFinalCode: string;
  invoiceNeedCode: string;
  accountOpeningAbility: string;
  demandTags: string;
  matchedPlan: string | null;
  generatedPlanContent: string;
  createdAt: string | Date;
};

type Filters = {
  q1: string;
  q2: string;
  q3: string;
  q4: string;
  q5: string;
  q6: string;
  q7: string;
};

const MALL: Record<string, string> = {
  ShopeeMall: "1.1",
  TKMall: "1.2",
  Lazmall: "1.3",
  以上都是: "1.4",
  没有需求: "1.5"
};
const PRODUCT: Record<string, string> = {
  "普货（不需要办理资质的产品）": "2.1",
  "涉证货（需要办理FDA/TISI/DLD等资质的产品）": "2.2",
  不销售任何产品: "2.3"
};
const LOGISTICS: Record<string, string> = {
  "正清（产品缴纳关税增值税入境泰国）": "3.1",
  "灰清（无法提供产品的关单以及税票）": "3.2",
  正清以及灰清都有: "3.3",
  无物流清关需求: "3.4"
};
const ACCOUNT: Record<string, string> = {
  可以: "7.1",
  不可以: "7.2"
};

const FILTER_OPTIONS: Array<{ key: keyof Filters; label: string; options: Array<{ code: string; label: string }> }> = [
  {
    key: "q1",
    label: "问题1 Mall店需求",
    options: [
      { code: "1.1", label: "ShopeeMall" },
      { code: "1.2", label: "TKMall" },
      { code: "1.3", label: "Lazmall" },
      { code: "1.4", label: "以上都是" },
      { code: "1.5", label: "没有需求" }
    ]
  },
  {
    key: "q2",
    label: "问题2 产品类型",
    options: [
      { code: "2.1", label: "普货" },
      { code: "2.2", label: "涉证货" },
      { code: "2.3", label: "不销售任何产品" }
    ]
  },
  {
    key: "q3",
    label: "问题3 物流清关",
    options: [
      { code: "3.1", label: "正清" },
      { code: "3.2", label: "灰清" },
      { code: "3.3", label: "正清及灰清" },
      { code: "3.4", label: "无物流清关需求" }
    ]
  },
  {
    key: "q4",
    label: "问题4 资质编码",
    options: [
      { code: "4.1.1", label: "4.1.1" },
      { code: "4.1.2", label: "4.1.2" },
      { code: "4.1.3", label: "4.1.3" },
      { code: "4.2.1", label: "4.2.1" },
      { code: "4.2.2", label: "4.2.2" },
      { code: "4.2.3", label: "4.2.3" },
      { code: "4.3.1", label: "4.3.1" },
      { code: "4.3.2", label: "4.3.2" },
      { code: "4.3.3", label: "4.3.3" },
      { code: "4.4.1", label: "4.4.1" },
      { code: "4.4.2", label: "4.4.2" },
      { code: "4.4.3", label: "4.4.3" },
      { code: "4.5", label: "4.5" }
    ]
  },
  {
    key: "q5",
    label: "问题5 签证编码",
    options: [
      { code: "5.1.1", label: "5.1.1" },
      { code: "5.1.2", label: "5.1.2" },
      { code: "5.2", label: "5.2" }
    ]
  },
  {
    key: "q6",
    label: "问题6 开票编码",
    options: [
      { code: "6.1", label: "6.1" },
      { code: "6.2", label: "6.2" }
    ]
  },
  {
    key: "q7",
    label: "问题7 开户编码",
    options: [
      { code: "7.1", label: "7.1" },
      { code: "7.2", label: "7.2" }
    ]
  }
];

function getCodes(row: PlanRecord): Filters {
  return {
    q1: MALL[row.mallNeed] || "",
    q2: PRODUCT[row.productType] || "",
    q3: LOGISTICS[row.logisticsType] || "",
    q4: row.qualificationFinalCode || "",
    q5: row.visaFinalCode || "",
    q6: row.invoiceNeedCode || "",
    q7: ACCOUNT[row.accountOpeningAbility] || ""
  };
}

export function AdminPlanManagement({ rows }: { rows: PlanRecord[] }) {
  const [records, setRecords] = useState<PlanRecord[]>(rows);
  const [keyword, setKeyword] = useState("");
  const [deleteMsg, setDeleteMsg] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const [filters, setFilters] = useState<Filters>({
    q1: "",
    q2: "",
    q3: "",
    q4: "",
    q5: "",
    q6: "",
    q7: ""
  });

  const filtered = useMemo(() => {
    return records.filter((row) => {
      const codes = getCodes(row);
      const hitKeyword = !keyword.trim()
        ? true
        : [row.customerName, row.customerCompany, row.customerPhone, row.customerEmail, row.evaluationCode]
            .join(" ")
            .toLowerCase()
            .includes(keyword.trim().toLowerCase());
      const hitFilters = (Object.keys(filters) as Array<keyof Filters>).every((key) => !filters[key] || codes[key] === filters[key]);
      return hitKeyword && hitFilters;
    });
  }, [records, keyword, filters]);

  async function onDelete(id: string) {
    setDeleteMsg("");
    setDeletingId(id);
    const res = await fetch("/api/admin/plan-management", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });
    const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
    if (!res.ok || !data.ok) {
      setDeleteMsg(data.error ?? "删除失败，请稍后重试");
      setDeletingId("");
      return;
    }
    setRecords((prev) => prev.filter((r) => r.id !== id));
    setDeleteMsg("方案记录已删除");
    setDeletingId("");
  }

  return (
    <section className="panel p-5">
      <h2 className="text-lg font-semibold">客户端方案记录</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <input
          className="input-base md:col-span-2"
          placeholder="客户信息查询：姓名/公司/电话/邮箱/评估码"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        {FILTER_OPTIONS.map((group) => (
          <select
            key={group.key}
            className="input-base"
            value={filters[group.key]}
            onChange={(e) => setFilters((prev) => ({ ...prev, [group.key]: e.target.value }))}
          >
            <option value="">筛选：{group.label}</option>
            {group.options.map((opt) => (
              <option key={opt.code} value={opt.code}>
                {opt.code} {opt.label}
              </option>
            ))}
          </select>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {filtered.map((row) => (
          <details key={row.id} className="rounded-lg border border-slate-200 bg-white p-3">
            <summary className="cursor-pointer list-none">
              <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                <p className="font-medium text-slate-900">
                  {row.customerName || "未填写姓名"} / {row.customerCompany || "未填写公司"}
                </p>
                <p className="text-xs text-slate-500">
                  评估码：{row.evaluationCode} · {new Date(row.createdAt).toLocaleString("zh-CN")}
                </p>
              </div>
            </summary>
            <div className="mt-3 space-y-2 text-sm text-slate-700">
              <div className="flex justify-end">
                <button
                  type="button"
                  className="rounded-md border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-700 transition hover:bg-red-100"
                  disabled={deletingId === row.id}
                  onClick={() => {
                    if (confirm("确认删除这条客户端方案记录吗？")) {
                      void onDelete(row.id);
                    }
                  }}
                >
                  {deletingId === row.id ? "删除中..." : "删除记录"}
                </button>
              </div>
              <p>联系电话：{row.customerPhone || "—"} | 联系邮箱：{row.customerEmail || "—"}</p>
              <p>7题编码：{row.demandTags || "—"}</p>
              <p>命中方案：{row.matchedPlan || "无"}</p>
              <p className="whitespace-pre-line rounded-md bg-slate-50 p-3">{row.generatedPlanContent || "当时未保存生成方案内容（旧数据）"}</p>
            </div>
          </details>
        ))}
        {filtered.length === 0 && <p className="text-sm text-slate-500">没有符合筛选条件的方案记录。</p>}
      </div>
      {deleteMsg && <p className={`mt-3 text-sm ${deleteMsg.includes("已") ? "text-emerald-700" : "text-red-600"}`}>{deleteMsg}</p>}
    </section>
  );
}
