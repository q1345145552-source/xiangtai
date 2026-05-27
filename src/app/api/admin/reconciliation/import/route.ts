import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, apiError, apiSuccess, str } from "@/lib/api-utils";

interface ImportRow {
  orderNo: string;
  orderDate: string;
  description: string;
  myAmount: number;
  whAmount: number;
  currency?: string;
  diffReason?: string;
}

// POST - 批量导入对账明细（JSON 格式）
export async function POST(req: NextRequest) {
  const authErr = await requireAdmin();
  if (authErr) return authErr;

  const body = await req.json();
  const batchId = str(body, "batchId");
  if (!batchId) return apiError("缺少batchId");

  const batch = await prisma.reconciliationBatch.findUnique({ where: { id: batchId } });
  if (!batch) return apiError("批次不存在", 404);
  if (batch.status === "confirmed") return apiError("已确认的批次不可导入数据");

  const rows: ImportRow[] = Array.isArray(body.rows) ? body.rows : [];
  if (rows.length === 0) return apiError("导入数据为空");

  const errors: string[] = [];
  const validRows: ImportRow[] = [];

  rows.forEach((row, idx) => {
    if (!row.orderNo) {
      errors.push(`第 ${idx + 1} 行：缺少订单号`);
      return;
    }
    if (typeof row.myAmount !== "number" || typeof row.whAmount !== "number") {
      errors.push(`第 ${idx + 1} 行：金额格式不正确`);
      return;
    }
    validRows.push(row);
  });

  if (validRows.length === 0) {
    return apiError(`全部数据校验失败：${errors.join("；")}`);
  }

  const created = await Promise.all(
    validRows.map((row) => {
      const diffAmount = parseFloat((row.myAmount - row.whAmount).toFixed(2));
      let matchStatus = "pending";
      if (Math.abs(diffAmount) < 0.01) matchStatus = "matched";
      else if (Math.abs(diffAmount) > 0) matchStatus = "mismatch";

      return prisma.reconciliationItem.create({
        data: {
          batchId,
          orderNo: row.orderNo,
          orderDate: row.orderDate || "",
          description: row.description || "",
          myAmount: row.myAmount,
          whAmount: row.whAmount,
          diffAmount,
          currency: row.currency || "THB",
          matchStatus,
          diffReason: row.diffReason || ""
        }
      });
    })
  );

  const allItems = await prisma.reconciliationItem.findMany({ where: { batchId } });
  await prisma.reconciliationBatch.update({
    where: { id: batchId },
    data: {
      totalOrders: allItems.length,
      matchedCount: allItems.filter((i) => i.matchStatus === "matched").length,
      diffCount: allItems.filter((i) => i.matchStatus === "mismatch").length,
      totalAmount: parseFloat(allItems.reduce((s, i) => s + i.myAmount, 0).toFixed(2)),
      whTotalAmount: parseFloat(allItems.reduce((s, i) => s + i.whAmount, 0).toFixed(2)),
      diffAmount: parseFloat(allItems.reduce((s, i) => s + i.diffAmount, 0).toFixed(2))
    }
  });

  await prisma.reconciliationAuditLog.create({
    data: {
      batchId,
      action: "batch_import",
      detail: `批量导入 ${created.length} 条明细${errors.length > 0 ? `，${errors.length} 条跳过` : ""}`
    }
  });

  return apiSuccess({
    imported: created.length,
    skipped: errors.length,
    errors: errors.length > 0 ? errors : undefined,
    totalInBatch: allItems.length
  });
}
