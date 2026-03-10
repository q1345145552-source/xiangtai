"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";

type AskResult = {
  answer: string;
  sources: string[];
};

const QUICK_QUESTIONS = ["泰国注册公司流程", "FDA认证周期", "Mall店入驻需要什么资质", "泰国本地物流怎么选择"];

export function FloatingAiChat() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AskResult | null>(null);

  async function ask(q?: string) {
    const text = (q ?? question).trim();
    if (!text) return;
    setLoading(true);
    const res = await fetch("/api/ai/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: text, contextPath: pathname })
    });
    const data = (await res.json()) as AskResult & { error?: string };
    setLoading(false);
    if (!res.ok) {
      setResult({ answer: data.error ?? "AI 服务暂不可用", sources: [] });
      return;
    }
    setResult(data);
    setQuestion(text);
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open ? (
        <div className="w-[360px] rounded-2xl border border-red-900/60 bg-black/95 p-4 text-zinc-100 shadow-[0_18px_50px_rgba(0,0,0,0.45)]">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-semibold text-red-300">AI 智能咨询</p>
            <button className="text-sm text-zinc-400 hover:text-zinc-200" onClick={() => setOpen(false)}>
              收起
            </button>
          </div>
          <div className="mb-3 flex flex-wrap gap-2">
            {QUICK_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => ask(q)}
                className="rounded-full border border-red-700/70 bg-red-950/40 px-3 py-1 text-xs text-red-100 transition hover:border-red-400 hover:bg-red-900/40"
              >
                {q}
              </button>
            ))}
          </div>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="input-base h-24 border-red-900/60 bg-black/40 text-zinc-100 placeholder:text-zinc-500 focus:border-red-500 focus:ring-red-900/30"
            placeholder="请输入你的问题..."
          />
          <button
            onClick={() => ask()}
            disabled={loading}
            className="mt-2 inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-red-700 to-red-600 px-4 py-2 font-medium text-white transition hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(220,38,38,0.35)]"
          >
            {loading ? "咨询中..." : "提交咨询"}
          </button>
          {result && (
            <div className="mt-3 rounded-lg border border-zinc-700 bg-black/35 p-3">
              <p className="whitespace-pre-line text-sm text-zinc-200">{result.answer}</p>
              {result.sources.length > 0 && (
                <p className="mt-2 text-xs text-zinc-400">来源：{result.sources.join(" / ")}</p>
              )}
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-full border border-red-500/70 bg-black/85 px-4 py-2 text-sm font-medium text-red-200 shadow-[0_10px_24px_rgba(153,27,27,0.35)] transition hover:-translate-y-0.5 hover:bg-red-900/40"
        >
          <span className="inline-block h-2 w-2 rounded-full bg-red-400" />
          AI 智能咨询
        </button>
      )}
    </div>
  );
}
