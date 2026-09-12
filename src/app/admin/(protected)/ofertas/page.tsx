import Link from "next/link";
import { Trash2 } from "lucide-react";
import { listMarketplaces } from "@/lib/services/marketplaces";
import { listAllOffersAdmin } from "@/lib/services/offers";
import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, Thead, Th, Tr, Td } from "@/components/ui/table";
import { ConfirmSubmitButton } from "@/components/ui/confirm-submit-button";
import { formatPrice, formatDateShort } from "@/lib/format";
import { MarketplaceForm } from "./marketplace-form";
import { createMarketplaceAction, updateMarketplaceAction, setMarketplaceActiveAction, deleteMarketplaceAction } from "./actions";

export const metadata = { title: "Ofertas e marketplaces" };

export default async function AdminOffersPage() {
  const [marketplaces, offers] = await Promise.all([listMarketplaces(), listAllOffersAdmin()]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink-900">Ofertas e marketplaces</h1>
        <p className="mt-1 text-sm text-ink-500">
          Marketplaces definem o domínio permitido para redirecionamento. Ofertas são gerenciadas dentro de cada produto.
        </p>
      </div>

      <Card>
        <CardBody>
          <CardTitle>Novo marketplace</CardTitle>
          <div className="mt-4">
            <MarketplaceForm action={createMarketplaceAction} idPrefix="new-mp" submitLabel="Criar marketplace" />
          </div>
        </CardBody>
      </Card>

      <div className="space-y-3">
        {marketplaces.map((mp) => (
          <Card key={mp.id}>
            <CardBody>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-ink-900">{mp.name}</span>
                  <Badge tone={mp.active ? "brand" : "neutral"}>{mp.active ? "Ativo" : "Inativo"}</Badge>
                  <span className="text-xs text-ink-400">{mp._count.offers} oferta(s)</span>
                </div>
                <div className="flex items-center gap-3">
                  <form action={setMarketplaceActiveAction.bind(null, mp.id, !mp.active)}>
                    <button type="submit" className="text-xs font-medium text-ink-600 hover:underline">
                      {mp.active ? "Desativar" : "Ativar"}
                    </button>
                  </form>
                  <form action={deleteMarketplaceAction.bind(null, mp.id)}>
                    <ConfirmSubmitButton
                      size="sm"
                      variant="ghost"
                      confirmTitle="Excluir marketplace"
                      confirmDescription="Só é possível excluir marketplaces sem ofertas vinculadas."
                      confirmLabel="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </ConfirmSubmitButton>
                  </form>
                </div>
              </div>
              <p className="mt-1 text-xs text-ink-400">Domínios: {mp.allowedHosts}</p>
              <details className="mt-3">
                <summary className="cursor-pointer text-xs font-medium text-ink-500">Editar</summary>
                <div className="mt-3">
                  <MarketplaceForm action={updateMarketplaceAction.bind(null, mp.id)} idPrefix={`mp-${mp.id}`} defaults={mp} />
                </div>
              </details>
            </CardBody>
          </Card>
        ))}
      </div>

      <div>
        <h2 className="font-display text-lg font-semibold text-ink-900">Todas as ofertas</h2>
        <div className="mt-3">
          {offers.length > 0 ? (
            <Table>
              <Thead>
                <tr>
                  <Th>Produto</Th>
                  <Th>Marketplace</Th>
                  <Th>Preço</Th>
                  <Th>Status</Th>
                  <Th>Última verificação</Th>
                </tr>
              </Thead>
              <tbody>
                {offers.map((offer) => (
                  <Tr key={offer.id}>
                    <Td>
                      <Link href={`/admin/produtos/${offer.product.id}`} className="text-brand-700 hover:underline">
                        {offer.product.title}
                      </Link>
                    </Td>
                    <Td>{offer.marketplace.name}</Td>
                    <Td>{formatPrice(offer.referencePrice, offer.currency) ?? "—"}</Td>
                    <Td>
                      <div className="flex gap-1">
                        {offer.isPrimary && <Badge tone="brand">Principal</Badge>}
                        <Badge tone={offer.active ? "neutral" : "danger"}>{offer.active ? "Ativa" : "Inativa"}</Badge>
                      </div>
                    </Td>
                    <Td>{formatDateShort(offer.lastCheckedAt) ?? "—"}</Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p className="text-sm text-ink-500">Nenhuma oferta cadastrada ainda.</p>
          )}
        </div>
      </div>
    </div>
  );
}
