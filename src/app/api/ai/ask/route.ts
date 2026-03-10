import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildAnswer } from "@/lib/ai";

export async function POST(req: NextRequest) {
  const started = Date.now();
  const body = await req.json();
  const question = String(body.question ?? "").trim();
  const contextPath = String(body.contextPath ?? "").trim();

  if (!question) {
    return NextResponse.json({ error: "问题不能为空" }, { status: 400 });
  }

  const aiBase = process.env.AI_BACKEND_URL ?? "http://127.0.0.1:8001";
  const retries = 3;
  let answer = "";
  let sources: string[] = [];
  let lastError = "";

  for (let i = 0; i < retries; i += 1) {
    try {
      const resp = await fetch(`${aiBase}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, contextPath })
      });
      if (!resp.ok) {
        lastError = `AI服务状态码 ${resp.status}`;
        await new Promise((r) => setTimeout(r, 400 * (i + 1)));
        continue;
      }
      const data = (await resp.json()) as { answer?: string; sources?: string[] };
      answer = String(data.answer ?? "").trim();
      sources = Array.isArray(data.sources) ? data.sources.map(String) : [];
      if (answer) break;
    } catch (e) {
      lastError = e instanceof Error ? e.message : "unknown";
      await new Promise((r) => setTimeout(r, 400 * (i + 1)));
    }
  }

  if (!answer) {
    const fallback = buildAnswer(question, []);
    answer = `${fallback.answer}\n\n（AI 服务暂不可用：${lastError || "未连接"}）`;
    sources = [];
  }

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
