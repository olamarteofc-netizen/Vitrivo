import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Tag,
  BarChart3,
  Settings,
  FileText,
  ExternalLink,
} from "lucide-react";
import { siteConfig } from "@/config/site";
import { SignOutButton } from "@/components/admin/sign-out-button";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/produtos", label: "Produtos", icon: Package },
  { href: "/admin/categorias", label: "Categorias e tags", icon: FolderTree },
  { href: "/admin/ofertas", label: "Ofertas e marketplaces", icon: Tag },
  { href: "/admin/conteudos", label: "Conteúdos", icon: FileText },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/configuracoes", label: "Configurações", icon: Settings },
];

export function AdminShell({
  children,
  userName,
}: {
  children: React.ReactNode;
  userName: string;
}) {
  return (
    <div className="min-h-screen bg-ink-50">
      <div className="flex">
        <aside className="hidden w-64 shrink-0 border-r border-border bg-surface lg:block">
          <div className="flex h-16 items-center border-b border-border px-5">
            <Link href="/admin" className="font-display text-lg font-bold text-ink-900">
              {siteConfig.name} <span className="text-ink-400">admin</span>
            </Link>
          </div>
          <nav className="space-y-1 p-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-ink-700 hover:bg-ink-100"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="border-t border-border p-3">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-ink-500 hover:bg-ink-100"
            >
              <ExternalLink className="h-4 w-4" />
              Ver site público
            </a>
          </div>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="flex h-16 items-center justify-between border-b border-border bg-surface px-4 lg:px-8">
            <nav className="flex gap-1 overflow-x-auto lg:hidden">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-medium text-ink-700 hover:bg-ink-100"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="ml-auto flex items-center gap-3">
              <span className="hidden text-sm text-ink-500 sm:inline">{userName}</span>
              <SignOutButton />
            </div>
          </header>
          <main className="flex-1 p-4 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
