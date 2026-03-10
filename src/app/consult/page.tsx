"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";

type AskResult = {
  answer: string;
  sources: string[];
};

export default function ConsultPage() {
  const pathname = usePathname();
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<AskResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function onAsk() {
    if (!question.trim()) return;
    setLoading(true);
    const res = await fetch("/api/ai/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, contextPath: pathname })
    });
    const data = (await res.json()) as AskResult;
    setResult(data);
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-red-900/50 bg-gradient-to-br from-black via-zinc-950 to-red-950 p-6 text-zinc-100 shadow-[0_16px_40px_rgba(0,0,0,0.35)]">
        <h1 className="text-2xl font-bold text-red-300">AI 智能咨询顾问</h1>
        <p className="mt-2 text-zinc-300">
          适用于政策、流程、材料、周期等百科型问题。示例：泰国注册公司要多久？
        </p>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="input-base mt-4 h-32 border-red-900/60 bg-black/40 text-zinc-100 placeholder:text-zinc-500 focus:border-red-500 focus:ring-red-900/30"
          placeholder="请输入你的问题..."
        />
        <button
          onClick={onAsk}
          disabled={loading}
          className="mt-3 inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-red-700 to-red-600 px-4 py-2 font-medium text-white transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(220,38,38,0.35)] active:scale-[0.98]"
        >
          {loading ? "咨询中..." : "提交咨询"}
        </button>
      </section>
      {result && (
        <section className="rounded-2xl border border-zinc-800 bg-zinc-950/95 p-6 text-zinc-100 shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
          <h2 className="text-lg font-semibold text-red-300">咨询结果</h2>
          <p className="mt-3 whitespace-pre-line text-zinc-300">{result.answer}</p>
          <div className="mt-4">
            <p className="text-sm font-medium text-red-200">来源：</p>
            <ul className="mt-2 list-disc pl-5 text-sm text-zinc-300">
              {result.sources.length ? (
                result.sources.map((s) => <li key={s}>{s}</li>)
              ) : (
                <li>暂无命中来源</li>
              )}
            </ul>
          </div>
        </section>
      )}
    </div>
  );
}
