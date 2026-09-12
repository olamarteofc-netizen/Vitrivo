import { describe, it, expect, beforeAll } from "vitest";
import { prisma } from "@/lib/prisma";
import { createProduct } from "@/lib/services/products";
import { createOffer, setPrimaryOffer, reorderOffers, listOffersByProduct } from "@/lib/services/offers";
import { createTestAdmin, createTestMarketplace, uniqueTitle } from "./helpers";

let adminId: string;
let marketplaceId: string;
let productId: string;

beforeAll(async () => {
  const admin = await createTestAdmin();
  adminId = admin.id;
  const marketplace = await createTestMarketplace({ allowedHosts: "loja-permitida.com.br" });
  marketplaceId = marketplace.id;
  const product = await createProduct(
    {
      title: uniqueTitle("Produto Ofertas"),
      shortDescription: "Resumo válido com dez chars",
      description: "Descrição válida com vinte caracteres",
    },
    adminId,
  );
  productId = product.id;
});

describe("offers service — allowlist e regras (integração)", () => {
  it("rejeita oferta cuja URL de afiliado não pertence ao domínio liberado do marketplace", async () => {
    await expect(
      createOffer({
        productId,
        marketplaceId,
        destinationUrl: "https://loja-permitida.com.br/produto",
        affiliateUrl: "https://dominio-nao-autorizado.com/produto",
      }),
    ).rejects.toThrow(/não permitida/i);
  });

  it("rejeita oferta cuja URL de destino não pertence ao domínio liberado", async () => {
    await expect(
      createOffer({
        productId,
        marketplaceId,
        destinationUrl: "https://dominio-nao-autorizado.com/produto",
        affiliateUrl: "https://loja-permitida.com.br/produto?ref=1",
      }),
    ).rejects.toThrow(/não permitida/i);
  });

  it("aceita oferta com URLs no domínio liberado (incluindo subdomínio)", async () => {
    const offer = await createOffer({
      productId,
      marketplaceId,
      destinationUrl: "https://www.loja-permitida.com.br/produto",
      affiliateUrl: "https://loja-permitida.com.br/produto?ref=1",
    });
    expect(offer.id).toBeTruthy();
  });

  it("garante que apenas uma oferta seja principal por produto", async () => {
    const offer1 = await createOffer({
      productId,
      marketplaceId,
      destinationUrl: "https://loja-permitida.com.br/p1",
      affiliateUrl: "https://loja-permitida.com.br/p1?ref=1",
      isPrimary: true,
    });
    const offer2 = await createOffer({
      productId,
      marketplaceId,
      destinationUrl: "https://loja-permitida.com.br/p2",
      affiliateUrl: "https://loja-permitida.com.br/p2?ref=1",
      isPrimary: true,
    });

    const offers = await listOffersByProduct(productId);
    const primaries = offers.filter((o) => o.isPrimary);
    expect(primaries).toHaveLength(1);
    expect(primaries[0].id).toBe(offer2.id);

    await setPrimaryOffer(productId, offer1.id);
    const offersAfter = await listOffersByProduct(productId);
    expect(offersAfter.filter((o) => o.isPrimary)).toHaveLength(1);
    expect(offersAfter.find((o) => o.id === offer1.id)?.isPrimary).toBe(true);
  });

  it("reordena ofertas conforme a lista de ids fornecida", async () => {
    const offers = await listOffersByProduct(productId);
    const reversedIds = offers.map((o) => o.id).reverse();
    await reorderOffers(productId, reversedIds);
    const updated = await prisma.offer.findMany({ where: { productId }, orderBy: { position: "asc" } });
    expect(updated.map((o) => o.id)).toEqual(reversedIds);
  });
});
