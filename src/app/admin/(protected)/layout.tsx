import { requireAdminSession } from "@/lib/session";
import { AdminShell } from "@/components/admin/admin-shell";

export const metadata = { title: { template: "%s | Admin", default: "Admin" }, robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdminSession();
  return <AdminShell userName={session.user.name ?? session.user.email ?? "Admin"}>{children}</AdminShell>;
}
