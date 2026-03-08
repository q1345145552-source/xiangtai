import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildAnswer, retrieveDocs } from "@/lib/ai";

export async function POST(req: NextRequest) {
  const started = Date.now();
  const body = await req.json();
  const question = String(body.question ?? "").trim();

  if (!question) {
    return NextResponse.json({ error: "问题不能为空" }, { status: 400 });
  }

  const docs = await prisma.knowledgeDoc.findMany({
    where: { isActive: true },
    orderBy: { updatedAt: "desc" }
  });
  const matched = retrieveDocs(question, docs);
  const { answer, sources } = buildAnswer(question, matched);

  await prisma.inquiryLog.create({
    data: {
      question,
      answer,
      sourceList: sources.join(","),
      latencyMs: Date.now() - started
    }
  });

  return NextResponse.json({ answer, sources });
}
