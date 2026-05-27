import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, apiError, apiSuccess, safeParseBody, str, num } from "@/lib/api-utils";

export async function GET() {
  const authErr = await requireAdmin();
  if (authErr) return authErr;

  const rows = await prisma.servicePage.findMany({
    orderBy: [{ domain: "asc" }, { sortOrder: "asc" }, { updatedAt: "desc" }]
  });
  return apiSuccess(rows);
}

export async function POST(req: NextRequest) {
  const authErr = await requireAdmin();
  if (authErr) return authErr;

  const { data: body, error } = await safeParseBody(req);
  if (error) return error;

  const row = await prisma.servicePage.create({
    data: {
      domain: str(body!, "domain"),
      slug: str(body!, "slug"),
      title: str(body!, "title"),
      description: str(body!, "description"),
      caseText: str(body!, "caseText"),
      entryName: str(body!, "entryName"),
      entryUrl: str(body!, "entryUrl"),
      sortOrder: num(body!, "sortOrder"),
      isActive: Boolean(body!.isActive ?? true)
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

  const existing = await prisma.servicePage.findUnique({ where: { id } });
  if (!existing) return apiError("服务不存在", 404);

  const row = await prisma.servicePage.update({
    where: { id },
    data: {
      domain: str(body!, "domain") || existing.domain,
      slug: str(body!, "slug") || existing.slug,
      title: str(body!, "title") || existing.title,
      description: str(body!, "description") || existing.description,
      caseText: str(body!, "caseText") || existing.caseText,
      entryName: str(body!, "entryName") || existing.entryName,
      entryUrl: str(body!, "entryUrl") || existing.entryUrl,
      sortOrder: body!.sortOrder !== undefined ? num(body!, "sortOrder") : existing.sortOrder,
      isActive: body!.isActive !== undefined ? Boolean(body!.isActive) : existing.isActive
    }
  });
  return apiSuccess(row);
}
