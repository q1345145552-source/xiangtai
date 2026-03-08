"use client";

import { useState } from "react";

type Doc = {
  id: string;
  title: string;
  version: string;
  sourceUrl: string | null;
};

export function AdminKbManager({ initial }: { initial: Doc[] }) {
  const [rows, setRows] = useState(initial);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");

  async function save() {
    const res = await fetch("/api/admin/kb/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, sourceUrl, version: "v1" })
    });
    if (!res.ok) return;
    const row = (await res.json()) as Doc;
    setRows((prev) => [row, ...prev]);
    setTitle("");
    setContent("");
    setSourceUrl("");
  }

  return (
    <div className="space-y-6">
      <section className="panel p-5">
        <h2 className="text-lg font-semibold">知识库导入</h2>
        <input
          className="input-base mt-3"
          placeholder="文档标题"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          className="input-base mt-2"
          placeholder="来源链接（可选）"
          value={sourceUrl}
          onChange={(e) => setSourceUrl(e.target.value)}
        />
        <textarea
          className="input-base mt-2 h-40"
          placeholder="政策/流程内容"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <button onClick={save} className="btn-primary mt-3">
          导入文档
        </button>
      </section>
      <section className="panel p-5">
        <h2 className="text-lg font-semibold">已导入文档</h2>
        <div className="mt-3 space-y-2">
          {rows.map((row) => (
            <article key={row.id} className="rounded-lg border border-slate-200 p-3 transition hover:shadow-sm">
              <p className="font-medium">{row.title}</p>
              <p className="text-sm text-slate-600">
                {row.version} {row.sourceUrl ? `| ${row.sourceUrl}` : ""}
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
