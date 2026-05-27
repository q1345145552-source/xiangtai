import { redirect } from "next/navigation";
import { isAdminAuthed } from "@/lib/admin-auth";
import { AdminLoginForm } from "@/components/admin-login-form";

export default async function AdminPage() {
  const authed = await isAdminAuthed();
  if (authed) {
    redirect("/admin/solutions");
  }

  return (
    <section className="panel mx-auto max-w-md p-6">
      <h1 className="text-xl font-semibold">管理员登录</h1>
      <p className="mt-2 text-sm text-slate-600">请输入管理员账号与密码进入后台。</p>
      <AdminLoginForm />
    </section>
  );
}
