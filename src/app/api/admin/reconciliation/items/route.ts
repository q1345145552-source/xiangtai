import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, apiError, apiSuccess, str, num } from "@/lib/api-utils";

// GET - 查询批次明细
export async function GET(req: NextRequest) {
  const authErr = await requireAdmin();
  if (authErr) return authErr;

  const { searchParams } = new URL(req.url);
  const batchId = searchParams.get("batchId");
  if (!batchId) return apiError("缺少batchId参数");

  const matchStatus = searchParams.get("matchStatus") || undefined;
  const where: Record<string, unknown> = { batchId };
  if (matchStatus) where.matchStatus = matchStatus;

  const items = await prisma.reconciliationItem.findMany({
    where,
    orderBy: { createdAt: "asc" }
  });

  const summary = {
    total: items.length,
    matched: items.filter((i) => i.matchStatus === "matched").length,
    mismatch: items.filter((i) => i.matchStatus === "mismatch").length,
    pending: items.filter((i) => i.matchStatus === "pending").length,
    ignored: items.filter((i) => i.matchStatus === "ignored").length,
    totalMyAmount: items.reduce((s, i) => s + i.myAmount, 0),
    totalWhAmount: items.reduce((s, i) => s + i.whAmount, 0),
    totalDiff: items.reduce((s, i) => s + i.diffAmount, 0)
  };

  return apiSuccess({ items, summary });
}

// POST - 添加对账明细
export async function POST(req: NextRequest) {
  const authErr = await requireAdmin();
  if (authErr) return authErr;

  const body = await req.json();
  const batchId = str(body, "batchId");
  if (!batchId) return apiError("缺少batchId");

  const batch = await prisma.reconciliationBatch.findUnique({ where: { id: batchId } });
  if (!batch) return apiError("批次不存在", 404);
  if (batch.status === "confirmed") return apiError("已确认的批次不可添加明细");

  const myAmount = num(body, "myAmount");
  const whAmount = num(body, "whAmount");
  const diffAmount = parseFloat((myAmount - whAmount).toFixed(2));

  let matchStatus = "pending";
  if (Math.abs(diffAmount) < 0.01) matchStatus = "matched";
  else if (Math.abs(diffAmount) > 0) matchStatus = "mismatch";

  const item = await prisma.reconciliationItem.create({
    data: {
      batchId,
      orderNo: str(body, "orderNo"),
      orderDate: str(body, "orderDate"),
      description: str(body, "description"),
      myAmount,
      whAmount,
      diffAmount,
      currency: str(body, "currency") || "THB",
      matchStatus,
      diffReason: str(body, "diffReason")
    }
  });

  await updateBatchSummary(batchId);
  return apiSuccess(item, 201);
}

// PUT - 更新对账明细
export async function PUT(req: NextRequest) {
  const authErr = await requireAdmin();
  if (authErr) return authErr;

  const body = await req.json();
  const id = str(body, "id");
  if (!id) return apiError("缺少明细ID");

  const existing = await prisma.reconciliationItem.findUnique({ where: { id } });
  if (!existing) return apiError("明细不存在", 404);

  const newMy = body.myAmount !== undefined ? num(body, "myAmount") : existing.myAmount;
  const newWh = body.whAmount !== undefined ? num(body, "whAmount") : existing.whAmount;

  const updated = await prisma.reconciliationItem.update({
    where: { id },
    data: {
      orderNo: str(body, "orderNo") || existing.orderNo,
      orderDate: str(body, "orderDate") || existing.orderDate,
      description: str(body, "description") || existing.description,
      myAmount: newMy,
      whAmount: newWh,
      diffAmount: parseFloat((newMy - newWh).toFixed(2)),
      matchStatus: str(body, "matchStatus") || existing.matchStatus,
      diffReason: str(body, "diffReason") || existing.diffReason,
      resolvedAt: str(body, "matchStatus") === "matched" ? new Date() : existing.resolvedAt
    }
  });

  await updateBatchSummary(existing.batchId);
  return apiSuccess(updated);
}

// DELETE - 删除对账明细
export async function DELETE(req: NextRequest) {
  const authErr = await requireAdmin();
  if (authErr) return authErr;

  const body = await req.json();
  const id = str(body, "id");
  if (!id) return apiError("缺少明细ID");

  const existing = await prisma.reconciliationItem.findUnique({ where: { id } });
  if (!existing) return apiError("明细不存在", 404);

  await prisma.reconciliationItem.delete({ where: { id } });
  await updateBatchSummary(existing.batchId);
  return apiSuccess({ ok: true, id });
}

async function updateBatchSummary(batchId: string) {
  const items = await prisma.reconciliationItem.findMany({ where: { batchId } });
  await prisma.reconciliationBatch.update({
    where: { id: batchId },
    data: {
      totalOrders: items.length,
      matchedCount: items.filter((i) => i.matchStatus === "matched").length,
      diffCount: items.filter((i) => i.matchStatus === "mismatch").length,
      totalAmount: parseFloat(items.reduce((s, i) => s + i.myAmount, 0).toFixed(2)),
      whTotalAmount: parseFloat(items.reduce((s, i) => s + i.whAmount, 0).toFixed(2)),
      diffAmount: parseFloat(items.reduce((s, i) => s + i.diffAmount, 0).toFixed(2))
    }
  });
}
