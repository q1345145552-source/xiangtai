"use client";

import { useMemo, useState } from "react";

type BigPlan = {
  id: string;
  title: string;
  tags: string;
  content: string;
  createdAt: string | Date;
};

type OptionPlan = {
  id?: string;
  questionNo: number;
  answerCode: string;
  answerLabel: string;
  content: string;
  isActive: boolean;
};

const QUESTION_BLOCKS = [
  { questionNo: 1, title: "问题1：Mall店需求", answers: [{ code: "1.1", label: "ShopeeMall" }, { code: "1.2", label: "TKMall" }, { code: "1.3", label: "Lazmall" }, { code: "1.4", label: "以上都是" }, { code: "1.5", label: "没有需求" }] },
  { questionNo: 2, title: "问题2：销售的产品类型", answers: [{ code: "2.1", label: "普货（不需要办理资质的产品）" }, { code: "2.2", label: "涉证货（需要办理FDA/TISI/DLD等资质的产品）" }, { code: "2.3", label: "不销售任何产品" }] },
  { questionNo: 3, title: "问题3：物流清关", answers: [{ code: "3.1", label: "正清（产品缴纳关税增值税入境泰国）" }, { code: "3.2", label: "灰清（无法提供产品的关单以及税票）" }, { code: "3.3", label: "正清以及灰清都有" }, { code: "3.4", label: "无物流清关需求" }] },
  {
    questionNo: 4,
    title: "问题4：资质需求（最终编码）",
    answers: [
      { code: "4.1.1", label: "FDA + 挂靠办理" }, { code: "4.1.2", label: "FDA + 自有地址真实办理" }, { code: "4.1.3", label: "FDA + 无地址真实办理" },
      { code: "4.2.1", label: "TISI + 挂靠办理" }, { code: "4.2.2", label: "TISI + 自有地址真实办理" }, { code: "4.2.3", label: "TISI + 无地址真实办理" },
      { code: "4.3.1", label: "DLD + 挂靠办理" }, { code: "4.3.2", label: "DLD + 自有地址真实办理" }, { code: "4.3.3", label: "DLD + 无地址真实办理" },
      { code: "4.4.1", label: "NBTC + 挂靠办理" }, { code: "4.4.2", label: "NBTC + 自有地址真实办理" }, { code: "4.4.3", label: "NBTC + 无地址真实办理" },
      { code: "4.5", label: "无认证需求" }
    ]
  },
  { questionNo: 5, title: "问题5：工作签证需求（最终编码）", answers: [{ code: "5.1.1", label: "是 + 有实际工作地址挂靠" }, { code: "5.1.2", label: "是 + 无实际工作地址挂靠" }, { code: "5.2", label: "否" }] },
  { questionNo: 6, title: "问题6：开票需求", answers: [{ code: "6.1", label: "有" }, { code: "6.2", label: "无" }] },
  { questionNo: 7, title: "问题7：法人是否能来泰国开户", answers: [{ code: "7.1", label: "可以" }, { code: "7.2", label: "不可以" }] }
] as const;

function splitSnapshotSections(content: string) {
  return content
    .split(/\n\n(?=【Q\d)/g)
    .map((section) => section.trim())
    .filter(Boolean);
}

export function AdminSolutionsManager({
  optionPlans,
  initialBigPlans
}: {
  optionPlans: OptionPlan[];
  initialBigPlans: BigPlan[];
}) {
  const [searchCode, setSearchCode] = useState("");
  const [optionMsg, setOptionMsg] = useState("");
  const [deleteMsg, setDeleteMsg] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const [optionMap, setOptionMap] = useState<Record<string, OptionPlan>>(() => {
    const map: Record<string, OptionPlan> = {};
    for (const row of optionPlans) map[row.answerCode] = row;
    for (const block of QUESTION_BLOCKS) {
      for (const answer of block.answers) {
        if (!map[answer.code]) {
          map[answer.code] = {
            questionNo: block.questionNo,
            answerCode: answer.code,
            answerLabel: answer.label,
            content: "",
            isActive: true
          };
        }
      }
    }
    return map;
  });
  const [bigPlans, setBigPlans] = useState<BigPlan[]>(initialBigPlans);

  const filteredBigPlans = useMemo(() => {
    if (!searchCode.trim()) return bigPlans;
    const key = searchCode.trim().toLowerCase();
    return bigPlans.filter((item) => item.title.toLowerCase().includes(key) || item.tags.toLowerCase().includes(key));
  }, [bigPlans, searchCode]);

  async function saveOptionPlans() {
    setOptionMsg("");
    const items = Object.values(optionMap).map((row) => ({
      questionNo: row.questionNo,
      answerCode: row.answerCode,
      answerLabel: row.answerLabel,
      content: row.content,
      isActive: row.isActive
    }));
    const res = await fetch("/api/admin/option-plans", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items })
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setOptionMsg(data.error ?? "保存失败，请稍后重试");
      return;
    }
    const data = (await res.json()) as { optionPlans: OptionPlan[]; bigPlans: BigPlan[] };
    const map: Record<string, OptionPlan> = {};
    for (const row of data.optionPlans) map[row.answerCode] = row;
    setOptionMap(map);
    setBigPlans(data.bigPlans);
    setOptionMsg("7题小方案配置保存成功，已生成1个大方案");
  }

  async function deleteBigPlan(id: string) {
    setDeleteMsg("");
    setDeletingId(id);
    const res = await fetch("/api/admin/solutions", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });
    const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; id?: string };
    if (!res.ok || !data.ok) {
      setDeleteMsg(data.error ?? "删除失败，请稍后重试");
      setDeletingId("");
      return;
    }
    setBigPlans((prev) => prev.filter((item) => item.id !== id));
    setDeleteMsg("大方案已删除");
    setDeletingId("");
  }

  return (
    <div className="space-y-6">
      <section className="panel p-5">
        <h2 className="text-lg font-semibold">7题小方案配置（可手动调整）</h2>
        <p className="mt-2 text-sm text-slate-600">每点击一次“保存7题小方案配置”，下方会新增1个大方案，与评估码无关。</p>
        <div className="mt-4 space-y-4">
          {QUESTION_BLOCKS.map((block) => (
            <section key={block.questionNo} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-base font-semibold text-slate-900">{block.title}</h3>
              <div className="mt-3 space-y-3">
                {block.answers.map((answer) => {
                  const row = optionMap[answer.code];
                  return (
                    <div key={answer.code} className="rounded-md border border-slate-200 bg-white p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-medium text-slate-800">
                          {answer.code} {answer.label}
                        </p>
                        <label className="flex items-center gap-2 text-xs text-slate-600">
                          <input
                            type="checkbox"
                            checked={row?.isActive ?? true}
                            onChange={(e) =>
                              setOptionMap((prev) => ({
                                ...prev,
                                [answer.code]: { ...prev[answer.code], isActive: e.target.checked }
                              }))
                            }
                          />
                          启用该回答小方案
                        </label>
                      </div>
                      <textarea
                        className="input-base mt-2 h-24"
                        placeholder="在这里填写该回答对应的小方案内容"
                        value={row?.content ?? ""}
                        onChange={(e) =>
                          setOptionMap((prev) => ({
                            ...prev,
                            [answer.code]: { ...prev[answer.code], content: e.target.value }
                          }))
                        }
                      />
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
        <button onClick={saveOptionPlans} className="btn-primary mt-3">
          保存7题小方案配置
        </button>
        {optionMsg && <p className={`mt-2 text-sm ${optionMsg.includes("成功") ? "text-emerald-700" : "text-red-600"}`}>{optionMsg}</p>}
      </section>

      <section className="panel p-5">
        <h2 className="text-lg font-semibold">方案库（按大方案查看）</h2>
        <div className="mt-3">
          <input
            className="input-base"
            placeholder="按大方案代码/编码筛选，例如 BP- 或 4.1.1"
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
          />
        </div>
        <div className="mt-3 space-y-3">
          {filteredBigPlans.map((item) => {
            const sections = splitSnapshotSections(item.content || "");
            return (
              <details key={item.id} className="rounded-lg border border-slate-200 bg-white p-3">
                <summary className="cursor-pointer list-none">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <h3 className="font-medium text-slate-900">大方案代码：{item.title}</h3>
                    <span className="inline-flex w-fit rounded bg-brand-50 px-2 py-1 text-xs font-medium text-brand-700">
                      包含编码：{item.tags || "未记录"}
                    </span>
                  </div>
                </summary>
                <div className="mt-3 space-y-3">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      className="rounded-md border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-700 transition hover:bg-red-100"
                      disabled={deletingId === item.id}
                      onClick={() => {
                        if (confirm(`确定删除大方案 ${item.title} 吗？`)) {
                          void deleteBigPlan(item.id);
                        }
                      }}
                    >
                      {deletingId === item.id ? "删除中..." : "删除方案"}
                    </button>
                  </div>
                  <div className="rounded-md border border-emerald-200 bg-emerald-50/40 p-3">
                    <p className="text-sm font-medium text-emerald-800">组合后大方案内容</p>
                    <p className="mt-2 whitespace-pre-line text-sm text-slate-700">{item.content || "暂无内容"}</p>
                  </div>
                  <div className="rounded-md bg-slate-50 p-3">
                    <p className="text-sm font-medium text-slate-800">7个小方案明细（展开查看）</p>
                    <div className="mt-2 space-y-2">
                      {sections.map((section, idx) => (
                        <details key={`${item.id}-${idx}`} className="rounded border border-slate-200 bg-white p-2">
                          <summary className="cursor-pointer text-sm font-medium text-slate-800">小方案 {idx + 1}</summary>
                          <p className="mt-2 whitespace-pre-line text-sm text-slate-700">{section}</p>
                        </details>
                      ))}
                      {sections.length === 0 && <p className="text-sm text-slate-500">该大方案暂无可拆分的小方案内容。</p>}
                    </div>
                  </div>
                </div>
              </details>
            );
          })}
          {filteredBigPlans.length === 0 && <p className="text-sm text-slate-500">暂无大方案，请先保存7题小方案配置。</p>}
        </div>
        {deleteMsg && <p className={`mt-3 text-sm ${deleteMsg.includes("已") ? "text-emerald-700" : "text-red-600"}`}>{deleteMsg}</p>}
      </section>
    </div>
  );
}
