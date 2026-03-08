"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "首页" },
  { href: "/solution", label: "评估方案" },
  { href: "/government", label: "公司注册/税务管理" },
  { href: "/qualification", label: "资质办理" },
  { href: "/logistics", label: "物流合作/海外仓" },
  { href: "/ecommerce", label: "电商增值服务" },
  { href: "/consult", label: "AI咨询" }
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-bold tracking-wide text-slate-900">
          湘泰出海<span className="text-brand-700">门户</span>
        </Link>
        <nav className="flex flex-wrap gap-2 text-sm">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  active
                    ? "rounded-md bg-brand-50 px-3 py-1.5 font-semibold text-brand-700"
                    : "rounded-md px-3 py-1.5 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
