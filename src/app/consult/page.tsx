"use client";

import { useState } from "react";

type AskResult = {
  answer: string;
  sources: string[];
};

export default function ConsultPage() {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<AskResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function onAsk() {
    if (!question.trim()) return;
    setLoading(true);
    const res = await fetch("/api/ai/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question })
    });
    const data = (await res.json()) as AskResult;
    setResult(data);
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <section className="panel p-6">
        <h1 className="text-2xl font-bold">AI 智能咨询顾问</h1>
        <p className="mt-2 text-slate-600">
          适用于政策、流程、材料、周期等百科型问题。示例：泰国注册公司要多久？
        </p>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="input-base mt-4 h-32"
          placeholder="请输入你的问题..."
        />
        <button
          onClick={onAsk}
          disabled={loading}
          className="btn-primary mt-3"
        >
          {loading ? "咨询中..." : "提交咨询"}
        </button>
      </section>
      {result && (
        <section className="panel p-6">
          <h2 className="text-lg font-semibold">咨询结果</h2>
          <p className="mt-3 whitespace-pre-line text-slate-700">{result.answer}</p>
          <div className="mt-4">
            <p className="text-sm font-medium">来源：</p>
            <ul className="mt-2 list-disc pl-5 text-sm text-slate-600">
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
