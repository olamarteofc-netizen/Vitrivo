import { describe, it, expect } from "vitest";
import { productInputSchema } from "@/lib/validation/product";
import { offerInputSchema } from "@/lib/validation/offer";
import { allowedHostsInputSchema, marketplaceInputSchema } from "@/lib/validation/marketplace";
import { loginInputSchema } from "@/lib/validation/auth";

describe("productInputSchema", () => {
  it("aceita um produto mínimo válido", () => {
    const result = productInputSchema.safeParse({
      title: "Produto válido",
      shortDescription: "Um resumo com mais de dez caracteres",
      description: "Uma descrição bem mais longa, com vinte caracteres ou mais",
    });
    expect(result.success).toBe(true);
  });

  it("rejeita título muito curto", () => {
    const result = productInputSchema.safeParse({
      title: "ab",
      shortDescription: "Um resumo com mais de dez caracteres",
      description: "Uma descrição bem mais longa, com vinte caracteres ou mais",
    });
    expect(result.success).toBe(false);
  });

  it("rejeita slug em formato inválido (maiúsculas/espaços)", () => {
    const result = productInputSchema.safeParse({
      title: "Produto válido",
      slug: "Produto Inválido",
      shortDescription: "Um resumo com mais de dez caracteres",
      description: "Uma descrição bem mais longa, com vinte caracteres ou mais",
    });
    expect(result.success).toBe(false);
  });

  it("usa DRAFT como status padrão", () => {
    const result = productInputSchema.parse({
      title: "Produto válido",
      shortDescription: "Um resumo com mais de dez caracteres",
      description: "Uma descrição bem mais longa, com vinte caracteres ou mais",
    });
    expect(result.status).toBe("DRAFT");
  });
});

describe("offerInputSchema", () => {
  const base = {
    productId: "p1",
    marketplaceId: "m1",
    destinationUrl: "https://shopee.com.br/produto",
    affiliateUrl: "https://shopee.com.br/produto?afiliado=1",
  };

  it("aceita uma oferta válida", () => {
    expect(offerInputSchema.safeParse(base).success).toBe(true);
  });

  it("rejeita URL de afiliado sem https", () => {
    const result = offerInputSchema.safeParse({ ...base, affiliateUrl: "http://shopee.com.br/produto" });
    expect(result.success).toBe(false);
  });

  it("rejeita preço de referência negativo", () => {
    const result = offerInputSchema.safeParse({ ...base, referencePrice: -10 });
    expect(result.success).toBe(false);
  });

  it("normaliza moeda para maiúsculas", () => {
    const result = offerInputSchema.parse({ ...base, currency: "brl" });
    expect(result.currency).toBe("BRL");
  });
});

describe("allowedHostsInputSchema", () => {
  it("normaliza lista separada por vírgula ou linha", () => {
    const result = allowedHostsInputSchema.parse("Shopee.com.br,\nWWW.s.shopee.com.br");
    expect(result).toEqual(["shopee.com.br", "s.shopee.com.br"]);
  });

  it("rejeita host com formato inválido", () => {
    const result = allowedHostsInputSchema.safeParse("não é um domínio");
    expect(result.success).toBe(false);
  });
});

describe("marketplaceInputSchema", () => {
  it("aceita marketplace válido", () => {
    const result = marketplaceInputSchema.safeParse({
      name: "Shopee",
      allowedHosts: "shopee.com.br",
    });
    expect(result.success).toBe(true);
  });
});

describe("loginInputSchema", () => {
  it("normaliza e-mail para minúsculas", () => {
    const result = loginInputSchema.parse({ email: "Admin@Exemplo.COM", password: "senhaforte123" });
    expect(result.email).toBe("admin@exemplo.com");
  });

  it("rejeita senha muito curta", () => {
    const result = loginInputSchema.safeParse({ email: "a@b.com", password: "123" });
    expect(result.success).toBe(false);
  });
});
