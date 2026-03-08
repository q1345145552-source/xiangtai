"use client";

import { useState } from "react";

type GenerateResp = {
  codes?: string[];
  error?: string;
};

export function AdminEvaluationCodesManager() {
  const [count, setCount] = useState(1);
  const [codes, setCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generateCodes() {
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/evaluation-codes/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ count })
    });
    const data = (await res.json()) as GenerateResp;
    if (!res.ok) {
      setError(data.error ?? "生成失败");
      setLoading(false);
      return;
    }
    setCodes(data.codes ?? []);
    setLoading(false);
  }

  async function copyAndRemove(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      setCodes((prev) => prev.filter((item) => item !== code));
    } catch {
      setError("复制失败，请检查浏览器权限");
    }
  }

  return (
    <div className="space-y-6">
      <section className="panel p-5">
        <h2 className="text-lg font-semibold">评估码自动生成器</h2>
        <p className="mt-2 text-sm text-slate-600">
          单次可生成 1-10 个评估码。复制后，该评估码会从当前列表中移除。
        </p>
        <div className="mt-4 flex items-center gap-3">
          <input
            className="input-base max-w-24"
            type="number"
            min={1}
            max={10}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
          />
          <button disabled={loading} onClick={generateCodes} className="btn-primary">
            {loading ? "生成中..." : "生成评估码"}
          </button>
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </section>

      <section className="panel p-5">
        <h2 className="text-lg font-semibold">待复制评估码</h2>
        {codes.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">暂无评估码，请先生成。</p>
        ) : (
          <div className="mt-3 space-y-2">
            {codes.map((code) => (
              <article key={code} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                <p className="font-mono text-sm font-semibold tracking-wide text-slate-800">{code}</p>
                <button className="btn-secondary" onClick={() => copyAndRemove(code)}>
                  复制
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
