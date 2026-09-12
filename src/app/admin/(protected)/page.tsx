import Link from "next/link";
import { Package, FolderTree, Tag, MousePointerClick, Mail } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, CardBody } from "@/components/ui/card";
import { getClickStats } from "@/lib/services/analytics";
import { countUnreadContactMessages } from "@/lib/services/contact";
import { formatDate } from "@/lib/format";

export const metadata = { title: "Dashboard" };

export default async function AdminDashboardPage() {
  const [productCounts, categoryCount, offerCount, unreadMessages, stats, recentAudit] = await Promise.all([
    prisma.product.groupBy({ by: ["status"], _count: { status: true } }),
    prisma.category.count(),
    prisma.offer.count({ where: { active: true } }),
    countUnreadContactMessages(),
    getClickStats("30d"),
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { adminUser: { select: { name: true } } },
    }),
  ]);

  const countByStatus = (status: string) =>
    productCounts.find((p) => p.status === status)?._count.status ?? 0;

  const cards = [
    { label: "Produtos publicados", value: countByStatus("PUBLISHED"), icon: Package, href: "/admin/produtos?status=PUBLISHED" },
    { label: "Rascunhos", value: countByStatus("DRAFT"), icon: Package, href: "/admin/produtos?status=DRAFT" },
    { label: "Categorias", value: categoryCount, icon: FolderTree, href: "/admin/categorias" },
    { label: "Ofertas ativas", value: offerCount, icon: Tag, href: "/admin/ofertas" },
    { label: "Cliques (30 dias)", value: stats.total, icon: MousePointerClick, href: "/admin/analytics" },
    { label: "Mensagens não lidas", value: unreadMessages, icon: Mail, href: "/admin/configuracoes#mensagens" },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink-900">Dashboard</h1>
      <p className="mt-1 text-sm text-ink-500">Resumo geral do site.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
        {cards.map((card) => (
          <Link key={card.label} href={card.href}>
            <Card className="transition-shadow hover:shadow-elevated">
              <CardBody className="flex items-center gap-4">
                <div className="rounded-xl bg-brand-100 p-3 text-brand-800">
                  <card.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-ink-900">{card.value}</p>
                  <p className="text-sm text-ink-500">{card.label}</p>
                </div>
              </CardBody>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardBody>
            <h2 className="font-display text-lg font-semibold text-ink-900">Produtos mais clicados (30 dias)</h2>
            {stats.byProduct.length > 0 ? (
              <ul className="mt-4 space-y-2">
                {stats.byProduct.slice(0, 6).map((row, i) => (
                  <li key={i} className="flex items-center justify-between text-sm">
                    <span className="truncate text-ink-700">{row.product?.title ?? "Produto removido"}</span>
                    <span className="font-semibold text-ink-900">{row.count}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-ink-500">Ainda não há cliques registrados neste período.</p>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <h2 className="font-display text-lg font-semibold text-ink-900">Atividade recente</h2>
            {recentAudit.length > 0 ? (
              <ul className="mt-4 space-y-2">
                {recentAudit.map((log) => (
                  <li key={log.id} className="text-sm text-ink-600">
                    <span className="font-medium text-ink-800">{log.adminUser.name}</span> · {log.action} ·{" "}
                    <span className="text-ink-400">{formatDate(log.createdAt)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-ink-500">Nenhuma atividade registrada ainda.</p>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
