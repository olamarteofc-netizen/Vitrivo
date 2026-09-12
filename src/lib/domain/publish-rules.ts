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
};

export type PublishCheckResult =
  | { canPublish: true }
  | { canPublish: false; reasons: string[] };

export function checkProductPublishable(input: PublishCheckInput): PublishCheckResult {
  const reasons: string[] = [];
  if (!input.title.trim()) reasons.push("Título é obrigatório.");
  if (!input.slug.trim()) reasons.push("Slug é obrigatório.");
  if (!input.shortDescription.trim()) reasons.push("Resumo curto é obrigatório.");
  if (!input.description.trim()) reasons.push("Descrição completa é obrigatória.");
  if (input.activeOfferCount < 1) {
    reasons.push("É necessário cadastrar ao menos uma oferta ativa para publicar.");
  }
  return reasons.length === 0 ? { canPublish: true } : { canPublish: false, reasons };
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
