import Link from "next/link";
import { Download } from "lucide-react";
import { getClickStats, type AnalyticsRange } from "@/lib/services/analytics";
import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { Table, Thead, Th, Tr, Td } from "@/components/ui/table";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/cn";

export const metadata = { title: "Analytics" };

const RANGES: { value: AnalyticsRange; label: string }[] = [
  { value: "7d", label: "7 dias" },
  { value: "30d", label: "30 dias" },
  { value: "90d", label: "90 dias" },
  { value: "all", label: "Tudo" },
];

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const rangeParam = typeof sp.range === "string" ? sp.range : "30d";
  const range: AnalyticsRange = RANGES.some((r) => r.value === rangeParam) ? (rangeParam as AnalyticsRange) : "30d";

  const stats = await getClickStats(range);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-900">Analytics de cliques</h1>
          <p className="mt-1 text-sm text-ink-500">{stats.total} clique(s) rastreado(s) no período.</p>
        </div>
        <a
          href={`/admin/analytics/export?range=${range}`}
          className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border px-3 text-sm font-medium text-ink-700 hover:bg-ink-100"
        >
          <Download className="h-4 w-4" />
          Exportar CSV
        </a>
      </div>

      <div className="mt-4 flex gap-1">
        {RANGES.map((r) => (
          <Link
            key={r.value}
            href={`/admin/analytics?range=${r.value}`}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium",
              r.value === range ? "bg-brand-700 text-white" : "text-ink-600 hover:bg-ink-100",
            )}
          >
            {r.label}
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardBody>
            <CardTitle>Por produto</CardTitle>
            {stats.byProduct.length > 0 ? (
              <ul className="mt-3 space-y-2 text-sm">
                {stats.byProduct.map((row, i) => (
                  <li key={i} className="flex justify-between">
                    <span className="truncate text-ink-700">{row.product?.title ?? "Produto removido"}</span>
                    <span className="font-semibold text-ink-900">{row.count}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-ink-500">Sem dados no período.</p>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <CardTitle>Por marketplace</CardTitle>
            {stats.byMarketplace.length > 0 ? (
              <ul className="mt-3 space-y-2 text-sm">
                {stats.byMarketplace.map((row, i) => (
                  <li key={i} className="flex justify-between">
                    <span className="text-ink-700">{row.name}</span>
                    <span className="font-semibold text-ink-900">{row.count}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-ink-500">Sem dados no período.</p>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <CardTitle>Por campanha (UTM)</CardTitle>
            {stats.byCampaign.length > 0 ? (
              <ul className="mt-3 space-y-2 text-sm">
                {stats.byCampaign.map((row, i) => (
                  <li key={i} className="flex justify-between">
                    <span className="text-ink-700">{row.campaign}</span>
                    <span className="font-semibold text-ink-900">{row.count}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-ink-500">Nenhuma campanha rastreada no período.</p>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <CardTitle>Por origem (UTM source)</CardTitle>
            {stats.bySource.length > 0 ? (
              <ul className="mt-3 space-y-2 text-sm">
                {stats.bySource.map((row, i) => (
                  <li key={i} className="flex justify-between">
                    <span className="text-ink-700">{row.source}</span>
                    <span className="font-semibold text-ink-900">{row.count}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-ink-500">Nenhuma origem rastreada no período.</p>
            )}
          </CardBody>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="font-display text-lg font-semibold text-ink-900">Cliques recentes</h2>
        <div className="mt-3">
          {stats.recent.length > 0 ? (
            <Table>
              <Thead>
                <tr>
                  <Th>Data</Th>
                  <Th>Produto</Th>
                  <Th>Marketplace</Th>
                  <Th>Dispositivo</Th>
                  <Th>Origem</Th>
                </tr>
              </Thead>
              <tbody>
                {stats.recent.map((click) => (
                  <Tr key={click.id}>
                    <Td>{formatDate(click.occurredAt)}</Td>
                    <Td>{click.product.title}</Td>
                    <Td>{click.offer.marketplace.name}</Td>
                    <Td>{click.deviceClass ?? "—"}</Td>
                    <Td>{click.utmSource ?? "—"}</Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p className="text-sm text-ink-500">Nenhum clique registrado ainda.</p>
          )}
        </div>
      </div>
    </div>
  );
}
