import type { DeviceClass } from "@/types";

/**
 * Validação de destinos de afiliado. Esta é a única camada que decide se uma
 * URL pode receber um visitante — a rota pública de saída (/sair/[offerId])
 * NUNCA aceita uma URL vinda de fora; ela sempre resolve a oferta no servidor
 * e revalida o destino aqui antes de redirecionar.
 */

export function normalizeHost(host: string): string {
  return host.trim().toLowerCase().replace(/^www\./, "");
}

export function parseAllowedHosts(raw: string | null | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((h) => normalizeHost(h))
    .filter(Boolean);
}

/** `host` é permitido se for igual a um host da lista ou subdomínio dele. */
export function isHostAllowed(hostname: string, allowedHosts: string[]): boolean {
  const host = normalizeHost(hostname);
  if (!host) return false;
  return allowedHosts.some((allowed) => host === allowed || host.endsWith(`.${allowed}`));
}

export type RedirectValidationResult =
  | { ok: true; url: URL }
  | { ok: false; reason: "invalid-url" | "invalid-protocol" | "host-not-allowed" };

export function validateAffiliateUrl(
  rawUrl: string,
  allowedHosts: string[],
): RedirectValidationResult {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return { ok: false, reason: "invalid-url" };
  }
  if (url.protocol !== "https:") {
    return { ok: false, reason: "invalid-protocol" };
  }
  if (!isHostAllowed(url.hostname, allowedHosts)) {
    return { ok: false, reason: "host-not-allowed" };
  }
  return { ok: true, url };
}

/** Heurística simples de classe de dispositivo a partir do User-Agent. */
export function classifyDevice(userAgent: string | null | undefined): DeviceClass {
  if (!userAgent) return "unknown";
  const ua = userAgent.toLowerCase();
  if (/ipad|tablet|(android(?!.*mobile))/.test(ua)) return "tablet";
  if (/mobile|iphone|ipod|android/.test(ua)) return "mobile";
  return "desktop";
}
