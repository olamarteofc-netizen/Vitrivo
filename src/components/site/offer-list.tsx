"use client";

import { cn } from "@/lib/cn";
import { formatPrice, formatDateShort } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { track } from "@/lib/analytics/client";

export type OfferView = {
  id: string;
  marketplaceName: string;
  disclosureText?: string | null;
  label?: string | null;
  notes?: string | null;
  referencePrice?: number | null;
  currency: string;
  lastCheckedAt?: string | Date | null;
  isPrimary: boolean;
};

export function OfferList({ productSlug, offers }: { productSlug: string; offers: OfferView[] }) {
  if (offers.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border p-4 text-sm text-ink-500">
        Nenhuma oferta disponível no momento. Volte em breve.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {offers.map((offer) => (
        <div
          key={offer.id}
          className={cn(
            "flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between",
            offer.isPrimary ? "border-brand-300 bg-brand-50" : "border-border bg-surface",
          )}
        >
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-ink-900">{offer.marketplaceName}</span>
              {offer.isPrimary && <Badge tone="brand">Melhor opção</Badge>}
            </div>
            {offer.label && <p className="mt-0.5 text-sm text-ink-600">{offer.label}</p>}
            {offer.referencePrice != null && (
              <p className="mt-1 text-lg font-semibold text-ink-900">
                {formatPrice(offer.referencePrice, offer.currency)}
              </p>
            )}
            {offer.lastCheckedAt && (
              <p className="text-xs text-ink-400">
                Verificado em {formatDateShort(offer.lastCheckedAt)} · preço e disponibilidade podem mudar no
                parceiro
              </p>
            )}
          </div>
          <a
            href={`/sair/${offer.id}?from=%2Fproduto%2F${productSlug}`}
            onClick={() =>
              track({ name: "cta_click", productSlug, offerId: offer.id, marketplace: offer.marketplaceName })
            }
            className="inline-flex shrink-0 items-center justify-center rounded-xl bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-800"
          >
            Ver produto
          </a>
        </div>
      ))}
    </div>
  );
}
