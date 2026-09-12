/**
 * Geração de slugs amigáveis, sem dependências externas. Remove acentos,
 * caracteres especiais e normaliza espaços/hífens.
 */
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // remove acentos
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Garante um slug não vazio, com fallback previsível. */
export function slugifyOrFallback(input: string, fallback: string): string {
  const slug = slugify(input);
  return slug.length > 0 ? slug : slugify(fallback);
}

/**
 * Gera um slug único dentro de uma coleção, anexando um sufixo numérico
 * quando necessário (ex.: "produto", "produto-2", "produto-3"...).
 */
export function uniqueSlug(
  base: string,
  isTaken: (candidate: string) => boolean,
): string {
  const normalized = slugifyOrFallback(base, "item");
  if (!isTaken(normalized)) return normalized;
  let attempt = 2;
  while (isTaken(`${normalized}-${attempt}`)) {
    attempt += 1;
  }
  return `${normalized}-${attempt}`;
}
