/**
 * Regras de publicação, isoladas de persistência para serem testadas em
 * unidade sem banco de dados.
 */
export type PublishCheckInput = {
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  activeOfferCount: number;
  mediaCount: number;
};

export type PublishCheckResult =
  | { canPublish: true }
  | { canPublish: false; reasons: string[] };

/**
 * Item do checklist visual de publicação (seção "Pronto para publicar" do
 * painel). Cada item bloqueante tem `blocking: true` — os demais (categoria,
 * SEO) podem existir como aviso não-bloqueante em telas futuras, mas hoje só
 * exibimos os itens obrigatórios aqui.
 */
export type PublishChecklistItem = { key: string; label: string; ok: boolean };

export function buildPublishChecklist(input: PublishCheckInput): PublishChecklistItem[] {
  return [
    { key: "title", label: "Título", ok: input.title.trim().length > 0 },
    { key: "slug", label: "Slug", ok: input.slug.trim().length > 0 },
    { key: "summary", label: "Resumo curto", ok: input.shortDescription.trim().length > 0 },
    { key: "description", label: "Descrição completa", ok: input.description.trim().length > 0 },
    { key: "media", label: "Imagem principal", ok: input.mediaCount > 0 },
    { key: "offer", label: "Oferta ativa", ok: input.activeOfferCount > 0 },
    // Sempre satisfeito junto com "Oferta ativa": pickPrimaryOffer() escolhe
    // automaticamente uma oferta principal (a marcada, ou a de menor posição)
    // sempre que existir ao menos uma oferta ativa.
    { key: "primaryOffer", label: "Oferta principal", ok: input.activeOfferCount > 0 },
  ];
}

export function checkProductPublishable(input: PublishCheckInput): PublishCheckResult {
  const checklist = buildPublishChecklist(input);
  const failing = checklist.filter((item) => !item.ok);
  if (failing.length === 0) return { canPublish: true };
  return {
    canPublish: false,
    reasons: failing.map((item) => `${item.label} pendente.`),
  };
}

/**
 * Escolhe a oferta principal de exibição: a marcada como `isPrimary` entre as
 * ativas; se nenhuma estiver marcada, a ativa de menor `position`.
 */
export type OfferLike = {
  id: string;
  isPrimary: boolean;
  active: boolean;
  position: number;
};

export function pickPrimaryOffer<T extends OfferLike>(offers: T[]): T | undefined {
  const active = offers.filter((o) => o.active);
  if (active.length === 0) return undefined;
  const marked = active.find((o) => o.isPrimary);
  if (marked) return marked;
  return [...active].sort((a, b) => a.position - b.position)[0];
}

export function sortAlternateOffers<T extends OfferLike>(offers: T[], primaryId: string | undefined): T[] {
  return offers
    .filter((o) => o.active && o.id !== primaryId)
    .sort((a, b) => a.position - b.position);
}
