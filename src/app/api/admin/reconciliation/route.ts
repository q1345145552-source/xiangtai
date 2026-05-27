import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, apiError, apiSuccess, str, num } from "@/lib/api-utils";

// GET - 查询对账批次列表
export async function GET(req: NextRequest) {
  const authErr = await requireAdmin();
  if (authErr) return authErr;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || undefined;
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("pageSize") ?? 20)));

  const where = status ? { status } : {};
  const [rows, total] = await Promise.all([
    prisma.reconciliationBatch.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize
    }),
    prisma.reconciliationBatch.count({ where })
  ]);

  return apiSuccess({ rows, total, page, pageSize });
}

// POST - 创建对账批次
export async function POST(req: NextRequest) {
  const authErr = await requireAdmin();
  if (authErr) return authErr;

  const body = await req.json();
  const title = str(body, "title");
  const warehouseName = str(body, "warehouseName");
  const periodStart = str(body, "periodStart");
  const periodEnd = str(body, "periodEnd");
  const notes = str(body, "notes");

  if (!title) return apiError("请填写批次标题");
  if (!warehouseName) return apiError("请填写仓库名称");
  if (!periodStart || !periodEnd) return apiError("请填写对账周期");

  // Auto-generate batch number
  const now = new Date();
  const pad = (v: number) => String(v).padStart(2, "0");
  const dateStr = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
  const count = await prisma.reconciliationBatch.count({
    where: { batchNo: { startsWith: `RC-${dateStr}` } }
  });
  const batchNo = `RC-${dateStr}-${String(count + 1).padStart(3, "0")}`;

  const batch = await prisma.reconciliationBatch.create({
    data: { batchNo, title, warehouseName, periodStart, periodEnd, notes }
  });

  await prisma.reconciliationAuditLog.create({
    data: {
      batchId: batch.id,
      action: "created",
      detail: `创建对账批次: ${batchNo} - ${title}`
    }
  });

  return apiSuccess(batch, 201);
}

// PUT - 更新对账批次状态
export async function PUT(req: NextRequest) {
  const authErr = await requireAdmin();
  if (authErr) return authErr;

  const body = await req.json();
  const id = str(body, "id");
  if (!id) return apiError("缺少批次ID");

  const existing = await prisma.reconciliationBatch.findUnique({ where: { id } });
  if (!existing) return apiError("批次不存在", 404);

  const status = str(body, "status");
  const validStatuses = ["draft", "reconciling", "confirmed", "disputed"];
  if (status && !validStatuses.includes(status)) {
    return apiError(`状态值不合法，允许: ${validStatuses.join(", ")}`);
  }

  const updated = await prisma.reconciliationBatch.update({
    where: { id },
    data: {
      title: str(body, "title") || existing.title,
      warehouseName: str(body, "warehouseName") || existing.warehouseName,
      periodStart: str(body, "periodStart") || existing.periodStart,
      periodEnd: str(body, "periodEnd") || existing.periodEnd,
      status: status || existing.status,
      notes: str(body, "notes") || existing.notes
    }
  });

  if (status && status !== existing.status) {
    await prisma.reconciliationAuditLog.create({
      data: {
        batchId: id,
        action: "status_change",
        detail: `状态变更: ${existing.status} -> ${status}`
      }
    });
  }

  return apiSuccess(updated);
}

// DELETE - 删除对账批次（仅草稿状态）
export async function DELETE(req: NextRequest) {
  const authErr = await requireAdmin();
  if (authErr) return authErr;

  const body = await req.json();
  const id = str(body, "id");
  if (!id) return apiError("缺少批次ID");

  const existing = await prisma.reconciliationBatch.findUnique({ where: { id } });
  if (!existing) return apiError("批次不存在", 404);
  if (existing.status !== "draft") return apiError("仅草稿状态的批次可删除");

  await prisma.reconciliationBatch.delete({ where: { id } });
  return apiSuccess({ ok: true, id });
}
