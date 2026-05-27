import { redirect } from "next/navigation";
import { isAdminAuthed } from "@/lib/admin-auth";
import { AdminLoginForm } from "@/components/admin-login-form";
import { AdminNav } from "@/components/admin-nav";

interface AdminPageWrapperProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  requireAuth?: boolean;
}

/**
 * Shared wrapper for all admin pages.
 * Handles auth check, navigation, and consistent layout.
 */
export async function AdminPageWrapper({
  title,
  description,
  children,
  requireAuth = true
}: AdminPageWrapperProps) {
  if (requireAuth) {
    const authed = await isAdminAuthed();
    if (!authed) {
      return (
        <section className="panel mx-auto max-w-md p-6">
          <h1 className="text-xl font-semibold">管理员登录</h1>
          <p className="mt-2 text-sm text-slate-600">请输入管理员账号与密码进入后台。</p>
          <AdminLoginForm />
        </section>
      );
    }
  }

  return (
    <section className="space-y-4 p-4">
      <AdminNav />
      <div>
        <h1 className="text-xl font-semibold text-zinc-200">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-zinc-500">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}
