"use client";

import { useActionState } from "react";
import { ArrowUp, ArrowDown, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmSubmitButton } from "@/components/ui/confirm-submit-button";
import { formatPrice, formatDateShort } from "@/lib/format";
import { OfferFormFields, type MarketplaceOption } from "./offer-form-fields";
import {
  createOfferAction,
  updateOfferAction,
  deleteOfferAction,
  setPrimaryOfferAction,
  toggleOfferActiveAction,
  markOfferCheckedAction,
  moveOfferAction,
  type OfferFormState,
} from "./actions";

type OfferItem = {
  id: string;
  marketplaceId: string;
  marketplace: { name: string };
  destinationUrl: string;
  affiliateUrl: string;
  referencePrice: number | null;
  currency: string;
  label: string | null;
  notes: string | null;
  isPrimary: boolean;
  active: boolean;
  lastCheckedAt: Date | null;
};

const initialState: OfferFormState = { status: "idle" };

export function OffersManager({
  productId,
  offers,
  marketplaces,
}: {
  productId: string;
  offers: OfferItem[];
  marketplaces: MarketplaceOption[];
}) {
  return (
    <div className="space-y-4">
      {offers.length === 0 && (
        <p className="rounded-xl border border-dashed border-border p-4 text-sm text-ink-500">
          Nenhuma oferta cadastrada. Adicione ao menos uma oferta ativa para poder publicar.
        </p>
      )}

      {offers.map((offer, index) => (
        <OfferCard
          key={offer.id}
          productId={productId}
          offer={offer}
          marketplaces={marketplaces}
          isFirst={index === 0}
          isLast={index === offers.length - 1}
        />
      ))}

      <details className="rounded-xl border border-dashed border-border p-4" data-testid="add-offer-form">
        <summary className="cursor-pointer text-sm font-semibold text-brand-700">+ Adicionar oferta</summary>
        <CreateOfferForm productId={productId} marketplaces={marketplaces} />
      </details>
    </div>
  );
}

function CreateOfferForm({ productId, marketplaces }: { productId: string; marketplaces: MarketplaceOption[] }) {
  const boundAction = createOfferAction.bind(null, productId);
  const [state, formAction, pending] = useActionState(boundAction, initialState);

  return (
    <form action={formAction} className="mt-4 space-y-3">
      <OfferFormFields marketplaces={marketplaces} idPrefix={`new-${productId}`} />
      {state.status === "error" && state.message && <p className="text-sm text-danger-600">{state.message}</p>}
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Adicionando…" : "Adicionar oferta"}
      </Button>
    </form>
  );
}

function OfferCard({
  productId,
  offer,
  marketplaces,
  isFirst,
  isLast,
}: {
  productId: string;
  offer: OfferItem;
  marketplaces: MarketplaceOption[];
  isFirst: boolean;
  isLast: boolean;
}) {
  const boundUpdate = updateOfferAction.bind(null, offer.id, productId);
  const [state, formAction, pending] = useActionState(boundUpdate, initialState);

  return (
    <div className="rounded-xl border border-border bg-surface p-4" data-testid="offer-card" data-offer-id={offer.id}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-ink-900">{offer.marketplace.name}</span>
          {offer.isPrimary && <Badge tone="brand">Principal</Badge>}
          {!offer.active && <Badge tone="danger">Inativa</Badge>}
          {offer.referencePrice != null && (
            <span className="text-sm text-ink-600">{formatPrice(offer.referencePrice, offer.currency)}</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <form action={moveOfferAction.bind(null, productId, offer.id, "up")}>
            <button type="submit" disabled={isFirst} className="text-ink-400 hover:text-ink-700 disabled:opacity-30" aria-label="Mover para cima">
              <ArrowUp className="h-4 w-4" />
            </button>
          </form>
          <form action={moveOfferAction.bind(null, productId, offer.id, "down")}>
            <button type="submit" disabled={isLast} className="text-ink-400 hover:text-ink-700 disabled:opacity-30" aria-label="Mover para baixo">
              <ArrowDown className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>

      <p className="mt-1 text-xs text-ink-400">
        {offer.lastCheckedAt ? `Verificado em ${formatDateShort(offer.lastCheckedAt)}` : "Ainda não verificado"}
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        {!offer.isPrimary && (
          <form action={setPrimaryOfferAction.bind(null, productId, offer.id)}>
            <button type="submit" className="text-xs font-medium text-brand-700 hover:underline">
              Definir como principal
            </button>
          </form>
        )}
        <form action={toggleOfferActiveAction.bind(null, offer.id, productId, !offer.active)}>
          <button type="submit" className="text-xs font-medium text-ink-600 hover:underline">
            {offer.active ? "Desativar" : "Ativar"}
          </button>
        </form>
        <form action={markOfferCheckedAction.bind(null, offer.id, productId)}>
          <button type="submit" className="flex items-center gap-1 text-xs font-medium text-ink-600 hover:underline">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Marcar verificado hoje
          </button>
        </form>
        <form action={deleteOfferAction.bind(null, offer.id, productId)}>
          <ConfirmSubmitButton
            size="sm"
            variant="ghost"
            className="h-auto p-0 text-xs font-medium text-danger-600 hover:underline"
            confirmTitle="Excluir oferta"
            confirmDescription="Esta ação não pode ser desfeita. O histórico de cliques desta oferta será perdido."
            confirmLabel="Excluir"
          >
            Excluir
          </ConfirmSubmitButton>
        </form>
      </div>

      <details className="mt-3">
        <summary className="cursor-pointer text-xs font-medium text-ink-500">Editar detalhes</summary>
        <form action={formAction} className="mt-3 space-y-3">
          <OfferFormFields marketplaces={marketplaces} defaults={offer} idPrefix={`edit-${offer.id}`} />
          {state.status === "error" && state.message && <p className="text-sm text-danger-600">{state.message}</p>}
          <Button type="submit" size="sm" variant="outline" disabled={pending}>
            {pending ? "Salvando…" : "Salvar alterações"}
          </Button>
        </form>
      </details>
    </div>
  );
}
