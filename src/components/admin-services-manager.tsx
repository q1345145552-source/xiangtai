"use client";

import { useState } from "react";

type Service = {
  id?: string;
  domain: string;
  slug: string;
  title: string;
  description: string;
  caseText: string;
  entryName: string;
  entryUrl: string;
  sortOrder: number;
  isActive: boolean;
};

export function AdminServicesManager({ initial }: { initial: Service[] }) {
  const [rows, setRows] = useState<Service[]>(initial);
  const [form, setForm] = useState<Service>({
    domain: "government",
    slug: "",
    title: "",
    description: "",
    caseText: "",
    entryName: "",
    entryUrl: "",
    sortOrder: 0,
    isActive: true
  });

  async function save() {
    const method = form.id ? "PUT" : "POST";
    const res = await fetch("/api/admin/services", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    if (!res.ok) return;
    const row = (await res.json()) as Service;
    if (form.id) {
      setRows((prev) => prev.map((p) => (p.id === row.id ? row : p)));
    } else {
      setRows((prev) => [row, ...prev]);
    }
    setForm({
      domain: "government",
      slug: "",
      title: "",
      description: "",
      caseText: "",
      entryName: "",
      entryUrl: "",
      sortOrder: 0,
      isActive: true
    });
  }

  return (
    <div className="space-y-6">
      <section className="panel p-5">
        <h2 className="text-lg font-semibold">业务内容维护</h2>
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          <select
            className="input-base"
            value={form.domain}
            onChange={(e) => setForm({ ...form, domain: e.target.value })}
          >
            <option value="government">工商财税服务</option>
            <option value="qualification">产品资质服务</option>
            <option value="logistics">物流仓储</option>
            <option value="ecommerce">电商增值</option>
          </select>
          <input
            className="input-base"
            placeholder="slug"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
          />
          <input
            className="input-base"
            placeholder="标题"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <input
            className="input-base"
            placeholder="入口名称"
            value={form.entryName}
            onChange={(e) => setForm({ ...form, entryName: e.target.value })}
          />
          <input
            className="input-base md:col-span-2"
            placeholder="入口链接"
            value={form.entryUrl}
            onChange={(e) => setForm({ ...form, entryUrl: e.target.value })}
          />
          <textarea
            className="input-base md:col-span-2"
            placeholder="业务介绍"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <textarea
            className="input-base md:col-span-2"
            placeholder="成功案例"
            value={form.caseText}
            onChange={(e) => setForm({ ...form, caseText: e.target.value })}
          />
        </div>
        <button onClick={save} className="btn-primary mt-3">
          保存
        </button>
      </section>
      <section className="panel p-5">
        <h2 className="text-lg font-semibold">已配置条目</h2>
        <div className="mt-3 space-y-2">
          {rows.map((row) => (
            <article key={row.id} className="rounded-lg border border-slate-200 p-3 transition hover:shadow-sm">
              <div className="flex items-center justify-between">
                <p className="font-medium">{row.title}</p>
                <button
                  className="text-sm text-brand-700 transition hover:text-brand-900"
                  onClick={() => setForm(row)}
                >
                  编辑
                </button>
              </div>
              <p className="text-sm text-slate-600">
                {row.domain} | {row.entryName}
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
