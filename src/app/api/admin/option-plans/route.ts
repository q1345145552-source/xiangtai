import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthed } from "@/lib/admin-auth";

type OptionPlanPayload = {
  questionNo?: number;
  answerCode?: string;
  answerLabel?: string;
  content?: string;
  isActive?: boolean;
};

export async function GET() {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }
  const rows = await prisma.questionOptionPlan.findMany({
    orderBy: [{ questionNo: "asc" }, { answerCode: "asc" }]
  });
  return NextResponse.json(rows);
}

export async function PUT(req: NextRequest) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }
  const body = await req.json();
  const items: OptionPlanPayload[] = Array.isArray(body.items) ? (body.items as OptionPlanPayload[]) : [];
  if (items.length === 0) {
    return NextResponse.json({ error: "缺少配置内容" }, { status: 400 });
  }

  await prisma.$transaction(async (tx) => {
    const normalizedItems = items
      .map((item) => ({
        questionNo: Number(item.questionNo ?? 0),
        answerCode: String(item.answerCode ?? "").trim(),
        answerLabel: String(item.answerLabel ?? "").trim(),
        content: String(item.content ?? ""),
        isActive: Boolean(item.isActive)
      }))
      .sort((a, b) => a.questionNo - b.questionNo || a.answerCode.localeCompare(b.answerCode));

    // 组合内容使用“本次已填写并启用”的全部小方案，确保管理员输入都完整保留。
    const snapshotRows = normalizedItems.filter((item) => item.isActive && item.content.trim());
    const now = new Date();
    const pad = (v: number) => String(v).padStart(2, "0");
    const datePart = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
    const baseCode = `BP-${datePart}`;
    const todayPlans = await tx.solutionPlan.findMany({
      where: {
        industry: "问卷大方案",
        OR: [{ title: baseCode }, { title: { startsWith: `${baseCode}-` } }]
      },
      select: { title: true }
    });
    let snapshotCode = baseCode;
    if (todayPlans.some((plan) => plan.title === baseCode)) {
      const used = new Set(
        todayPlans
          .map((plan) => {
            const matched = plan.title.match(new RegExp(`^${baseCode}-(\\d+)$`));
            return matched ? Number(matched[1]) : null;
          })
          .filter((v): v is number => v !== null)
      );
      let next = 1;
      while (used.has(next)) next += 1;
      snapshotCode = `${baseCode}-${next}`;
    }
    const snapshotContent =
      snapshotRows.length > 0
        ? snapshotRows
            .map(
              (row) =>
                `【Q${row.questionNo} ${row.answerCode} ${row.answerLabel}】\n${row.content.trim()}`
            )
            .join("\n\n")
        : "本次保存未勾选完整小方案内容。";

    for (const item of items) {
      const questionNo = Number(item.questionNo ?? 0);
      const answerCode = String(item.answerCode ?? "").trim();
      const answerLabel = String(item.answerLabel ?? "").trim();
      const content = String(item.content ?? "");
      const isActive = Boolean(item.isActive);
      const planTitle = `Q${questionNo}-${answerCode} ${answerLabel}`;

      await tx.questionOptionPlan.upsert({
        where: { answerCode },
        update: { questionNo, answerLabel, content, isActive },
        create: { questionNo, answerCode, answerLabel, content, isActive }
      });

      const existingPlan = await tx.solutionPlan.findFirst({
        where: {
          industry: "问卷小方案",
          tags: answerCode
        }
      });

      if (existingPlan) {
        await tx.solutionPlan.update({
          where: { id: existingPlan.id },
          data: {
            title: planTitle,
            content,
            status: isActive ? "active" : "inactive"
          }
        });
      } else {
        await tx.solutionPlan.create({
          data: {
            title: planTitle,
            industry: "问卷小方案",
            tags: answerCode,
            content,
            status: isActive ? "active" : "inactive"
          }
        });
      }
    }

    await tx.solutionPlan.create({
      data: {
        title: snapshotCode,
        industry: "问卷大方案",
        tags: snapshotRows.map((row) => row.answerCode).join(","),
        content: snapshotContent,
        status: "active"
      }
    });
  });

  const [rows, bigPlans] = await Promise.all([
    prisma.questionOptionPlan.findMany({
      orderBy: [{ questionNo: "asc" }, { answerCode: "asc" }]
    }),
    prisma.solutionPlan.findMany({
      where: { industry: "问卷大方案" },
      orderBy: [{ createdAt: "desc" }]
    })
  ]);
  return NextResponse.json({ optionPlans: rows, bigPlans });
}
