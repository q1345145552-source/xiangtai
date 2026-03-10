"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import logoImage from "../../assets/4.png";

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
    <header className="sticky top-0 z-30 border-b border-red-900/50 bg-black/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-wide text-zinc-100">
          <Image src={logoImage} alt="湘泰出海 Logo" className="h-7 w-auto object-contain" priority />
          <span>
            湘泰出海<span className="text-brand-700">门户</span>
          </span>
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
                    ? "rounded-md border border-red-400 bg-red-700/90 px-3 py-1.5 font-semibold text-white shadow-[0_8px_16px_rgba(185,28,28,0.35)]"
                    : "rounded-md border border-red-900/70 bg-black/40 px-3 py-1.5 text-zinc-200 transition duration-200 hover:-translate-y-0.5 hover:border-red-500 hover:bg-red-900/35 hover:text-white active:translate-y-0 active:scale-[0.98]"
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
