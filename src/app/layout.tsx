import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "湘泰出海门户系统",
  description: "湘泰出海官方门户与业务中枢"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        <SiteHeader />
        <main className="mx-auto min-h-[calc(100vh-130px)] max-w-7xl px-4 py-8">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
