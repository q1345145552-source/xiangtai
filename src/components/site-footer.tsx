import Link from "next/link";

const quickLinks = [
  { href: "/", label: "首页" },
  { href: "/solution", label: "评估方案" },
  { href: "/consult", label: "AI咨询" }
];

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-slate-200/70 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
        <p>© {new Date().getFullYear()} 湘泰出海 版权所有 · 泰国一站式本土服务平台</p>
        <div className="flex flex-wrap gap-3 text-xs text-slate-500">
          {quickLinks.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-brand-700">
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
