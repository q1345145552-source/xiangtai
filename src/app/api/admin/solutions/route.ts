import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, apiError, apiSuccess, safeParseBody, str } from "@/lib/api-utils";

export async function GET() {
  const authErr = await requireAdmin();
  if (authErr) return authErr;

  const rows = await prisma.solutionPlan.findMany({
    orderBy: { updatedAt: "desc" }
  });
  return apiSuccess(rows);
}

export async function POST(req: NextRequest) {
  const authErr = await requireAdmin();
  if (authErr) return authErr;

  const { data: body, error } = await safeParseBody(req);
  if (error) return error;

  const row = await prisma.solutionPlan.create({
    data: {
      title: str(body!, "title"),
      industry: str(body!, "industry"),
      tags: str(body!, "tags"),
      content: str(body!, "content"),
      status: str(body!, "status") || "active"
    }
  });
  return apiSuccess(row, 201);
}

export async function PUT(req: NextRequest) {
  const authErr = await requireAdmin();
  if (authErr) return authErr;

  const { data: body, error } = await safeParseBody(req);
  if (error) return error;

  const id = str(body!, "id");
  if (!id) return apiError("缺少ID");

  const existing = await prisma.solutionPlan.findUnique({ where: { id } });
  if (!existing) return apiError("方案不存在", 404);

  const row = await prisma.solutionPlan.update({
    where: { id },
    data: {
      title: str(body!, "title") || existing.title,
      industry: str(body!, "industry") || existing.industry,
      tags: str(body!, "tags") || existing.tags,
      content: str(body!, "content") || existing.content,
      status: str(body!, "status") || existing.status
    }
  });
  return apiSuccess(row);
}

export async function DELETE(req: NextRequest) {
  const authErr = await requireAdmin();
  if (authErr) return authErr;

  const { data: body, error } = await safeParseBody(req);
  if (error) return error;

  const id = str(body!, "id");
  if (!id) return apiError("缺少ID");

  const row = await prisma.solutionPlan.findUnique({ where: { id } });
  if (!row) return apiError("方案不存在", 404);
  if (row.industry !== "问卷大方案") return apiError("仅支持删除大方案快照");

  await prisma.solutionPlan.delete({ where: { id } });
  return apiSuccess({ ok: true, id });
}
