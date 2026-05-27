"use client";
import { useState, useEffect, useCallback } from "react";

interface ReconciliationBatch {
  id: string;
  batchNo: string;
  title: string;
  warehouseName: string;
  periodStart: string;
  periodEnd: string;
  status: string;
  totalOrders: number;
  matchedCount: number;
  diffCount: number;
  totalAmount: number;
  whTotalAmount: number;
  diffAmount: number;
  notes: string;
  createdAt: string;
}

interface ReconciliationItem {
  id: string;
  batchId: string;
  orderNo: string;
  orderDate: string;
  description: string;
  myAmount: number;
  whAmount: number;
  diffAmount: number;
  currency: string;
  matchStatus: string;
  diffReason: string;
  resolvedAt: string | null;
}

interface BatchSummary {
  total: number;
  matched: number;
  mismatch: number;
  pending: number;
  ignored: number;
  totalMyAmount: number;
  totalWhAmount: number;
  totalDiff: number;
}

const STATUS_LABELS: Record<string, string> = {
  draft: "草稿",
  reconciling: "对账中",
  confirmed: "已确认",
  disputed: "有争议"
};

const MATCH_LABELS: Record<string, string> = {
  pending: "待匹配",
  matched: "已匹配",
  mismatch: "有差异",
  ignored: "已忽略"
};

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-zinc-700 text-zinc-300",
  reconciling: "bg-blue-900/60 text-blue-300",
  confirmed: "bg-green-900/60 text-green-300",
  disputed: "bg-red-900/60 text-red-300"
};

const MATCH_COLORS: Record<string, string> = {
  pending: "bg-zinc-700 text-zinc-300",
  matched: "bg-green-900/60 text-green-300",
  mismatch: "bg-red-900/60 text-red-300",
  ignored: "bg-yellow-900/60 text-yellow-300"
};

export function AdminReconciliationManager() {
  const [batches, setBatches] = useState<ReconciliationBatch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<ReconciliationBatch | null>(null);
  const [items, setItems] = useState<ReconciliationItem[]>([]);
  const [summary, setSummary] = useState<BatchSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showImportForm, setShowImportForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");

  // Create batch form
  const [formTitle, setFormTitle] = useState("");
  const [formWarehouse, setFormWarehouse] = useState("");
  const [formPeriodStart, setFormPeriodStart] = useState("");
  const [formPeriodEnd, setFormPeriodEnd] = useState("");
  const [formNotes, setFormNotes] = useState("");

  // Add item form
  const [itemOrderNo, setItemOrderNo] = useState("");
  const [itemOrderDate, setItemOrderDate] = useState("");
  const [itemDesc, setItemDesc] = useState("");
  const [itemMyAmount, setItemMyAmount] = useState("");
  const [itemWhAmount, setItemWhAmount] = useState("");
  const [itemCurrency, setItemCurrency] = useState("THB");

  // Import
  const [importJson, setImportJson] = useState("");
  const [importResult, setImportResult] = useState<string>("");

  const loadBatches = useCallback(async () => {
    setLoading(true);
    try {
      const qs = filterStatus ? `?status=${filterStatus}` : "";
      const res = await fetch(`/api/admin/reconciliation${qs}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setBatches(data.rows || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  const loadItems = useCallback(async (batchId: string) => {
    try {
      const res = await fetch(`/api/admin/reconciliation/items?batchId=${batchId}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setItems(data.items || []);
      setSummary(data.summary || null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载明细失败");
    }
  }, []);

  useEffect(() => { loadBatches(); }, [loadBatches]);
  useEffect(() => { if (selectedBatch) loadItems(selectedBatch.id); }, [selectedBatch, loadItems]);

  async function createBatch() {
    setError("");
    try {
      const res = await fetch("/api/admin/reconciliation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formTitle,
          warehouseName: formWarehouse,
          periodStart: formPeriodStart,
          periodEnd: formPeriodEnd,
          notes: formNotes
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setShowCreateForm(false);
      setFormTitle(""); setFormWarehouse(""); setFormPeriodStart(""); setFormPeriodEnd(""); setFormNotes("");
      loadBatches();
    } catch (e) {
      setError(e instanceof Error ? e.message : "创建失败");
    }
  }

  async function updateBatchStatus(batch: ReconciliationBatch, newStatus: string) {
    setError("");
    try {
      const res = await fetch("/api/admin/reconciliation", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: batch.id, status: newStatus })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      loadBatches();
      if (selectedBatch?.id === batch.id) setSelectedBatch(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "更新失败");
    }
  }

  async function deleteBatch(batch: ReconciliationBatch) {
    if (!confirm(`确定删除批次 ${batch.batchNo}？`)) return;
    setError("");
    try {
      const res = await fetch("/api/admin/reconciliation", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: batch.id })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      if (selectedBatch?.id === batch.id) { setSelectedBatch(null); setItems([]); setSummary(null); }
      loadBatches();
    } catch (e) {
      setError(e instanceof Error ? e.message : "删除失败");
    }
  }

  async function addItem() {
    if (!selectedBatch) return;
    setError("");
    try {
      const res = await fetch("/api/admin/reconciliation/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batchId: selectedBatch.id,
          orderNo: itemOrderNo,
          orderDate: itemOrderDate,
          description: itemDesc,
          myAmount: parseFloat(itemMyAmount) || 0,
          whAmount: parseFloat(itemWhAmount) || 0,
          currency: itemCurrency
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setItemOrderNo(""); setItemOrderDate(""); setItemDesc(""); setItemMyAmount(""); setItemWhAmount("");
      loadItems(selectedBatch.id);
      loadBatches();
    } catch (e) {
      setError(e instanceof Error ? e.message : "添加失败");
    }
  }

  async function updateItemMatch(item: ReconciliationItem, matchStatus: string, diffReason?: string) {
    setError("");
    try {
      const res = await fetch("/api/admin/reconciliation/items", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, matchStatus, diffReason: diffReason || item.diffReason })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      if (selectedBatch) loadItems(selectedBatch.id);
      loadBatches();
    } catch (e) {
      setError(e instanceof Error ? e.message : "更新失败");
    }
  }

  async function deleteItem(item: ReconciliationItem) {
    if (!confirm("确定删除该明细？")) return;
    setError("");
    try {
      const res = await fetch("/api/admin/reconciliation/items", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      if (selectedBatch) loadItems(selectedBatch.id);
      loadBatches();
    } catch (e) {
      setError(e instanceof Error ? e.message : "删除失败");
    }
  }

  async function importData() {
    if (!selectedBatch) return;
    setError(""); setImportResult("");
    try {
      const rows = JSON.parse(importJson);
      if (!Array.isArray(rows)) throw new Error("数据格式错误，需要 JSON 数组");
      const res = await fetch("/api/admin/reconciliation/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batchId: selectedBatch.id, rows })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setImportResult(`成功导入 ${data.imported} 条${data.skipped > 0 ? `，跳过 ${data.skipped} 条` : ""}`);
      setImportJson("");
      setShowImportForm(false);
      loadItems(selectedBatch.id);
      loadBatches();
    } catch (e) {
      if (e instanceof SyntaxError) {
        setError("JSON 格式错误，请检查数据格式");
      } else {
        setError(e instanceof Error ? e.message : "导入失败");
      }
    }
  }

  function formatMoney(v: number) {
    return v.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-950/30 p-3 text-red-300">
          {error}
          <button onClick={() => setError("")} className="ml-3 text-red-400 underline">关闭</button>
        </div>
      )}
      {importResult && (
        <div className="rounded-lg border border-green-500/30 bg-green-950/30 p-3 text-green-300">
          {importResult}
          <button onClick={() => setImportResult("")} className="ml-3 text-green-400 underline">关闭</button>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={() => setShowCreateForm(true)} className="rounded-lg bg-red-700 px-4 py-2 text-white hover:bg-red-600">
          新建对账批次
        </button>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-200"
        >
          <option value="">全部状态</option>
          <option value="draft">草稿</option>
          <option value="reconciling">对账中</option>
          <option value="confirmed">已确认</option>
          <option value="disputed">有争议</option>
        </select>
        <button onClick={loadBatches} className="rounded-lg border border-zinc-700 px-3 py-2 text-zinc-300 hover:bg-zinc-800">
          刷新
        </button>
      </div>

      {/* Create form */}
      {showCreateForm && (
        <div className="rounded-lg border border-zinc-700 bg-zinc-900 p-4">
          <h3 className="mb-3 font-medium text-zinc-200">新建对账批次</h3>
          <div className="grid gap-3 md:grid-cols-2">
            <input placeholder="批次标题" value={formTitle} onChange={(e) => setFormTitle(e.target.value)}
              className="rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-zinc-200" />
            <input placeholder="仓库名称" value={formWarehouse} onChange={(e) => setFormWarehouse(e.target.value)}
              className="rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-zinc-200" />
            <input type="date" placeholder="对账开始日期" value={formPeriodStart} onChange={(e) => setFormPeriodStart(e.target.value)}
              className="rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-zinc-200" />
            <input type="date" placeholder="对账结束日期" value={formPeriodEnd} onChange={(e) => setFormPeriodEnd(e.target.value)}
              className="rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-zinc-200" />
            <textarea placeholder="备注（选填）" value={formNotes} onChange={(e) => setFormNotes(e.target.value)}
              className="rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-zinc-200 md:col-span-2" rows={2} />
          </div>
          <div className="mt-3 flex gap-2">
            <button onClick={createBatch} className="rounded bg-red-700 px-4 py-2 text-white hover:bg-red-600">创建</button>
            <button onClick={() => setShowCreateForm(false)} className="rounded border border-zinc-700 px-4 py-2 text-zinc-300 hover:bg-zinc-800">取消</button>
          </div>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[1fr,1.5fr]">
        {/* Batch list */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-zinc-400">对账批次 ({batches.length})</h3>
          {loading && <p className="text-zinc-500">加载中...</p>}
          {batches.map((b) => (
            <div
              key={b.id}
              onClick={() => setSelectedBatch(b)}
              className={`cursor-pointer rounded-lg border p-3 transition ${
                selectedBatch?.id === b.id
                  ? "border-red-500/50 bg-red-950/20"
                  : "border-zinc-800 bg-zinc-900 hover:border-zinc-600"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-zinc-500">{b.batchNo}</span>
                <span className={`rounded px-2 py-0.5 text-xs ${STATUS_COLORS[b.status] || "bg-zinc-700 text-zinc-300"}`}>
                  {STATUS_LABELS[b.status] || b.status}
                </span>
              </div>
              <p className="mt-1 text-sm font-medium text-zinc-200">{b.title}</p>
              <p className="text-xs text-zinc-500">{b.warehouseName} · {b.periodStart} ~ {b.periodEnd}</p>
              <div className="mt-2 flex gap-4 text-xs text-zinc-400">
                <span>订单 {b.totalOrders}</span>
                <span className="text-green-400">匹配 {b.matchedCount}</span>
                <span className="text-red-400">差异 {b.diffCount}</span>
              </div>
              {b.totalAmount > 0 && (
                <div className="mt-1 flex gap-4 text-xs">
                  <span className="text-zinc-400">我方: {formatMoney(b.totalAmount)}</span>
                  <span className="text-zinc-400">仓库: {formatMoney(b.whTotalAmount)}</span>
                  <span className={b.diffAmount === 0 ? "text-green-400" : "text-red-400"}>
                    差额: {formatMoney(b.diffAmount)}
                  </span>
                </div>
              )}
            </div>
          ))}
          {batches.length === 0 && !loading && (
            <p className="py-8 text-center text-zinc-500">暂无对账批次</p>
          )}
        </div>

        {/* Detail panel */}
        {selectedBatch && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-medium text-zinc-200">
                {selectedBatch.batchNo} - {selectedBatch.title}
              </h3>
              <div className="flex flex-wrap gap-2">
                {selectedBatch.status === "draft" && (
                  <button onClick={() => updateBatchStatus(selectedBatch, "reconciling")}
                    className="rounded bg-blue-700 px-3 py-1 text-sm text-white hover:bg-blue-600">开始对账</button>
                )}
                {selectedBatch.status === "reconciling" && (
                  <>
                    <button onClick={() => updateBatchStatus(selectedBatch, "confirmed")}
                      className="rounded bg-green-700 px-3 py-1 text-sm text-white hover:bg-green-600">确认对账</button>
                    <button onClick={() => updateBatchStatus(selectedBatch, "disputed")}
                      className="rounded bg-yellow-700 px-3 py-1 text-sm text-white hover:bg-yellow-600">标记争议</button>
                  </>
                )}
                {selectedBatch.status === "disputed" && (
                  <button onClick={() => updateBatchStatus(selectedBatch, "reconciling")}
                    className="rounded bg-blue-700 px-3 py-1 text-sm text-white hover:bg-blue-600">重新对账</button>
                )}
                {selectedBatch.status === "draft" && (
                  <button onClick={() => deleteBatch(selectedBatch)}
                    className="rounded bg-red-900 px-3 py-1 text-sm text-red-300 hover:bg-red-800">删除</button>
                )}
              </div>
            </div>

            {/* Summary */}
            {summary && (
              <div className="grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
                <div className="rounded border border-zinc-800 bg-zinc-900 p-2">
                  <p className="text-xs text-zinc-500">总笔数</p>
                  <p className="text-lg font-semibold text-zinc-200">{summary.total}</p>
                </div>
                <div className="rounded border border-zinc-800 bg-zinc-900 p-2">
                  <p className="text-xs text-zinc-500">已匹配</p>
                  <p className="text-lg font-semibold text-green-400">{summary.matched}</p>
                </div>
                <div className="rounded border border-zinc-800 bg-zinc-900 p-2">
                  <p className="text-xs text-zinc-500">有差异</p>
                  <p className="text-lg font-semibold text-red-400">{summary.mismatch}</p>
                </div>
                <div className="rounded border border-zinc-800 bg-zinc-900 p-2">
                  <p className="text-xs text-zinc-500">差额合计</p>
                  <p className={`text-lg font-semibold ${summary.totalDiff === 0 ? "text-green-400" : "text-red-400"}`}>
                    {formatMoney(summary.totalDiff)}
                  </p>
                </div>
              </div>
            )}

            {/* Action buttons */}
            {selectedBatch.status !== "confirmed" && (
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setShowImportForm(!showImportForm)}
                  className="rounded border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800">
                  {showImportForm ? "关闭导入" : "批量导入"}
                </button>
              </div>
            )}

            {/* Import form */}
            {showImportForm && (
              <div className="rounded border border-zinc-700 bg-zinc-900 p-3">
                <p className="mb-2 text-sm text-zinc-300">
                  粘贴 JSON 数组，每条记录包含: orderNo, orderDate, description, myAmount, whAmount, currency(可选)
                </p>
                <textarea
                  value={importJson}
                  onChange={(e) => setImportJson(e.target.value)}
                  placeholder={'[\n  {"orderNo":"ORD001","orderDate":"2024-01-15","description":"入库费","myAmount":1500,"whAmount":1500},\n  {"orderNo":"ORD002","orderDate":"2024-01-16","description":"仓储费","myAmount":3200,"whAmount":3100}\n]'}
                  className="w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 font-mono text-xs text-zinc-200"
                  rows={6}
                />
                <button onClick={importData}
                  className="mt-2 rounded bg-red-700 px-4 py-1.5 text-sm text-white hover:bg-red-600">开始导入</button>
              </div>
            )}

            {/* Add item form */}
            {selectedBatch.status !== "confirmed" && (
              <div className="rounded border border-zinc-700 bg-zinc-900 p-3">
                <p className="mb-2 text-sm font-medium text-zinc-300">添加单条明细</p>
                <div className="grid gap-2 md:grid-cols-3">
                  <input placeholder="订单号" value={itemOrderNo} onChange={(e) => setItemOrderNo(e.target.value)}
                    className="rounded border border-zinc-700 bg-zinc-800 px-2 py-1.5 text-sm text-zinc-200" />
                  <input type="date" placeholder="日期" value={itemOrderDate} onChange={(e) => setItemOrderDate(e.target.value)}
                    className="rounded border border-zinc-700 bg-zinc-800 px-2 py-1.5 text-sm text-zinc-200" />
                  <input placeholder="业务描述" value={itemDesc} onChange={(e) => setItemDesc(e.target.value)}
                    className="rounded border border-zinc-700 bg-zinc-800 px-2 py-1.5 text-sm text-zinc-200" />
                  <input type="number" step="0.01" placeholder="我方金额" value={itemMyAmount} onChange={(e) => setItemMyAmount(e.target.value)}
                    className="rounded border border-zinc-700 bg-zinc-800 px-2 py-1.5 text-sm text-zinc-200" />
                  <input type="number" step="0.01" placeholder="仓库方金额" value={itemWhAmount} onChange={(e) => setItemWhAmount(e.target.value)}
                    className="rounded border border-zinc-700 bg-zinc-800 px-2 py-1.5 text-sm text-zinc-200" />
                  <select value={itemCurrency} onChange={(e) => setItemCurrency(e.target.value)}
                    className="rounded border border-zinc-700 bg-zinc-800 px-2 py-1.5 text-sm text-zinc-200">
                    <option value="THB">THB</option>
                    <option value="CNY">CNY</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
                <button onClick={addItem}
                  className="mt-2 rounded bg-red-700 px-4 py-1.5 text-sm text-white hover:bg-red-600">添加</button>
              </div>
            )}

            {/* Items table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-left text-xs text-zinc-500">
                    <th className="p-2">订单号</th>
                    <th className="p-2">日期</th>
                    <th className="p-2">描述</th>
                    <th className="p-2 text-right">我方金额</th>
                    <th className="p-2 text-right">仓库金额</th>
                    <th className="p-2 text-right">差额</th>
                    <th className="p-2">状态</th>
                    <th className="p-2">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b border-zinc-800/50 hover:bg-zinc-900/50">
                      <td className="p-2 font-mono text-xs text-zinc-300">{item.orderNo}</td>
                      <td className="p-2 text-xs text-zinc-400">{item.orderDate}</td>
                      <td className="p-2 text-xs text-zinc-300">{item.description}</td>
                      <td className="p-2 text-right text-xs text-zinc-300">{formatMoney(item.myAmount)}</td>
                      <td className="p-2 text-right text-xs text-zinc-300">{formatMoney(item.whAmount)}</td>
                      <td className={`p-2 text-right text-xs font-medium ${item.diffAmount === 0 ? "text-green-400" : "text-red-400"}`}>
                        {formatMoney(item.diffAmount)}
                      </td>
                      <td className="p-2">
                        <span className={`rounded px-1.5 py-0.5 text-xs ${MATCH_COLORS[item.matchStatus] || ""}`}>
                          {MATCH_LABELS[item.matchStatus] || item.matchStatus}
                        </span>
                      </td>
                      <td className="p-2">
                        <div className="flex gap-1">
                          {item.matchStatus === "mismatch" && (
                            <button onClick={() => updateItemMatch(item, "matched")}
                              className="rounded bg-green-900/50 px-1.5 py-0.5 text-xs text-green-300 hover:bg-green-800/50">确认</button>
                          )}
                          {item.matchStatus === "pending" && (
                            <>
                              <button onClick={() => updateItemMatch(item, "matched")}
                                className="rounded bg-green-900/50 px-1.5 py-0.5 text-xs text-green-300 hover:bg-green-800/50">匹配</button>
                              <button onClick={() => updateItemMatch(item, "mismatch")}
                                className="rounded bg-red-900/50 px-1.5 py-0.5 text-xs text-red-300 hover:bg-red-800/50">差异</button>
                            </>
                          )}
                          {item.matchStatus !== "ignored" && (
                            <button onClick={() => updateItemMatch(item, "ignored")}
                              className="rounded bg-yellow-900/50 px-1.5 py-0.5 text-xs text-yellow-300 hover:bg-yellow-800/50">忽略</button>
                          )}
                          {selectedBatch.status !== "confirmed" && (
                            <button onClick={() => deleteItem(item)}
                              className="rounded bg-zinc-800 px-1.5 py-0.5 text-xs text-zinc-400 hover:bg-zinc-700">删除</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {items.length === 0 && (
                <p className="py-8 text-center text-zinc-500">暂无对账明细，请添加或导入数据</p>
              )}
            </div>
          </div>
        )}

        {!selectedBatch && (
          <div className="flex items-center justify-center rounded-lg border border-dashed border-zinc-700 p-12 text-zinc-500">
            ← 选择一个对账批次查看详情
          </div>
        )}
      </div>
    </div>
  );
}
