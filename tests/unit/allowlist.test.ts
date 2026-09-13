import { describe, it, expect } from "vitest";
import {
  normalizeHost,
  parseAllowedHosts,
  isHostAllowed,
  validateAffiliateUrl,
  classifyDevice,
} from "@/lib/redirect/allowlist";
import { MARKETPLACE_BOOTSTRAP } from "@/lib/domain/marketplace-bootstrap";

describe("normalizeHost", () => {
  it("coloca em minúsculas e remove www.", () => {
    expect(normalizeHost("WWW.Shopee.com.br")).toBe("shopee.com.br");
  });

  it("remove espaços nas pontas", () => {
    expect(normalizeHost("  shopee.com.br  ")).toBe("shopee.com.br");
  });
});

describe("parseAllowedHosts", () => {
  it("separa por vírgula e normaliza cada host", () => {
    expect(parseAllowedHosts("Shopee.com.br, WWW.s.shopee.com.br")).toEqual([
      "shopee.com.br",
      "s.shopee.com.br",
    ]);
  });

  it("retorna array vazio para entrada vazia/nula", () => {
    expect(parseAllowedHosts("")).toEqual([]);
    expect(parseAllowedHosts(null)).toEqual([]);
  });
});

describe("isHostAllowed", () => {
  const allowed = ["shopee.com.br", "mercadolivre.com.br"];

  it("aceita host exatamente igual", () => {
    expect(isHostAllowed("shopee.com.br", allowed)).toBe(true);
  });

  it("aceita subdomínios do host permitido", () => {
    expect(isHostAllowed("s.shopee.com.br", allowed)).toBe(true);
  });

  it("rejeita domínios não relacionados", () => {
    expect(isHostAllowed("shopee.com.br.evil.com", allowed)).toBe(false);
    expect(isHostAllowed("notshopee.com.br", allowed)).toBe(false);
    expect(isHostAllowed("amazon.com.br", allowed)).toBe(false);
  });

  it("rejeita quando a lista permitida está vazia", () => {
    expect(isHostAllowed("shopee.com.br", [])).toBe(false);
  });
});

describe("validateAffiliateUrl", () => {
  const allowed = ["shopee.com.br"];

  it("aceita URL https de host permitido", () => {
    const result = validateAffiliateUrl("https://shopee.com.br/produto/123?afiliado=x", allowed);
    expect(result.ok).toBe(true);
  });

  it("rejeita protocolo não-https", () => {
    const result = validateAffiliateUrl("http://shopee.com.br/produto/123", allowed);
    expect(result).toEqual({ ok: false, reason: "invalid-protocol" });
  });

  it("rejeita host fora da allowlist (proteção contra open redirect)", () => {
    const result = validateAffiliateUrl("https://malicious-site.com/phishing", allowed);
    expect(result).toEqual({ ok: false, reason: "host-not-allowed" });
  });

  it("rejeita URL malformada", () => {
    const result = validateAffiliateUrl("não-é-uma-url", allowed);
    expect(result).toEqual({ ok: false, reason: "invalid-url" });
  });

  it("rejeita tentativa de disfarçar host via userinfo/path", () => {
    // ataques comuns de open redirect: usar shopee.com.br como usuário ou subpath de outro domínio
    const result = validateAffiliateUrl("https://shopee.com.br@evil.com/path", allowed);
    expect(result.ok).toBe(false);
  });
});

describe("marketplace bootstrap — Mercado Livre e meli.la", () => {
  const mercadoLivre = MARKETPLACE_BOOTSTRAP.find((m) => m.slug === "mercado-livre")!;

  it("aceita link curto de afiliado meli.la para Mercado Livre", () => {
    const result = validateAffiliateUrl("https://meli.la/abcDEF123", mercadoLivre.allowedHosts);
    expect(result.ok).toBe(true);
  });

  it("aceita URL longa oficial mercadolivre.com.br", () => {
    const result = validateAffiliateUrl(
      "https://produto.mercadolivre.com.br/MLB-123456-escova-eletrica-_JM",
      mercadoLivre.allowedHosts,
    );
    expect(result.ok).toBe(true);
  });

  it("rejeita domínio falso que só contém mercadolivre.com.br como prefixo de outro host", () => {
    const result = validateAffiliateUrl(
      "https://mercadolivre.com.br.site-malicioso.com/produto",
      mercadoLivre.allowedHosts,
    );
    expect(result).toEqual({ ok: false, reason: "host-not-allowed" });
  });

  it("rejeita domínio parecido mas não relacionado a meli.la", () => {
    const result = validateAffiliateUrl("https://meli.la.evil.com/x", mercadoLivre.allowedHosts);
    expect(result).toEqual({ ok: false, reason: "host-not-allowed" });
  });
});

describe("classifyDevice", () => {
  it("identifica mobile", () => {
    expect(classifyDevice("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)")).toBe("mobile");
  });

  it("identifica tablet", () => {
    expect(classifyDevice("Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)")).toBe("tablet");
  });

  it("identifica desktop por padrão", () => {
    expect(classifyDevice("Mozilla/5.0 (Windows NT 10.0; Win64; x64)")).toBe("desktop");
  });

  it("retorna unknown para user-agent ausente", () => {
    expect(classifyDevice(null)).toBe("unknown");
    expect(classifyDevice(undefined)).toBe("unknown");
  });
});
