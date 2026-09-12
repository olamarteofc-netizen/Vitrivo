import { describe, it, expect, beforeAll } from "vitest";
import { createProduct } from "@/lib/services/products";
import { createOffer } from "@/lib/services/offers";
import { recordOutboundClick, getClickStats } from "@/lib/services/analytics";
import { createTestAdmin, createTestMarketplace, uniqueTitle } from "./helpers";

let productId: string;
let offerId: string;

beforeAll(async () => {
  const admin = await createTestAdmin();
  const marketplace = await createTestMarketplace({ allowedHosts: "loja-analytics.com.br" });
  const product = await createProduct(
    {
      title: uniqueTitle("Produto Analytics"),
      shortDescription: "Resumo válido com dez chars",
      description: "Descrição válida com vinte caracteres",
    },
    admin.id,
  );
  productId = product.id;
  const offer = await createOffer({
    productId,
    marketplaceId: marketplace.id,
    destinationUrl: "https://loja-analytics.com.br/produto",
    affiliateUrl: "https://loja-analytics.com.br/produto?ref=1",
  });
  offerId = offer.id;
});

describe("analytics service — registro e agregação de cliques (integração)", () => {
  it("registra um clique com dados anonimizados", async () => {
    const click = await recordOutboundClick({
      offerId,
      productId,
      sessionId: "hash-anonimo-abc",
      referrer: "https://google.com",
      landingPath: "/produto/teste",
      deviceClass: "mobile",
      utm: { utmSource: "google", utmCampaign: "teste-analytics" },
    });
    expect(click.id).toBeTruthy();
    expect(click.utmSource).toBe("google");
  });

  it("agrega estatísticas por produto e por campanha", async () => {
    await recordOutboundClick({
      offerId,
      productId,
      sessionId: "hash-anonimo-def",
      deviceClass: "desktop",
      utm: { utmCampaign: "teste-analytics" },
    });

    const stats = await getClickStats("all");
    expect(stats.total).toBeGreaterThanOrEqual(2);
    const productStat = stats.byProduct.find((p) => p.product?.id === productId);
    expect(productStat?.count).toBeGreaterThanOrEqual(2);
    const campaignStat = stats.byCampaign.find((c) => c.campaign === "teste-analytics");
    expect(campaignStat?.count).toBeGreaterThanOrEqual(2);
  });
});
