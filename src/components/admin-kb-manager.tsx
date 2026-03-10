"use client";

import { useState } from "react";

type Doc = {
  id: string;
  title: string;
  version: string;
  sourceUrl: string | null;
  tags: string;
};

export function AdminKbManager({ initial }: { initial: Doc[] }) {
  const [rows, setRows] = useState(initial);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [tags, setTags] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  async function saveText() {
    setSaving(true);
    const res = await fetch("/api/admin/kb/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, sourceUrl, tags, version: "v1" })
    });
    setSaving(false);
    if (!res.ok) return;
    const row = (await res.json()) as Doc;
    setRows((prev) => [row, ...prev]);
    setTitle("");
    setContent("");
    setSourceUrl("");
    setTags("");
  }

  async function saveFile() {
    if (!file) return;
    setSaving(true);
    const form = new FormData();
    form.set("file", file, file.name);
    form.set("title", title || file.name);
    form.set("sourceUrl", sourceUrl);
    form.set("tags", tags);
    const res = await fetch("/api/admin/kb/upload", {
      method: "POST",
      body: form
    });
    setSaving(false);
    if (!res.ok) return;
    const row = (await res.json()) as Doc;
    setRows((prev) => [row, ...prev]);
    setTitle("");
    setSourceUrl("");
    setTags("");
    setFile(null);
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
        <input className="input-base mt-2" placeholder="来源链接（可选）" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} />
        <input
          className="input-base mt-2"
          placeholder="文档标签（逗号分隔，如：工商类,物流类）"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />
        <input
          type="file"
          accept=".pdf,.md,.txt"
          className="input-base mt-2"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        <textarea
          className="input-base mt-2 h-40"
          placeholder="政策/流程内容"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <button onClick={saveText} disabled={saving} className="btn-primary">
            {saving ? "处理中..." : "导入文本到知识库"}
          </button>
          <button onClick={saveFile} disabled={saving || !file} className="btn-secondary">
            {saving ? "处理中..." : "上传文件到知识库"}
          </button>
        </div>
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
              {row.tags && <p className="mt-1 text-xs text-slate-500">标签：{row.tags}</p>}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
