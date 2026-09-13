import { describe, it, expect, beforeAll } from "vitest";
import { NextRequest } from "next/server";
import { createProduct, publishProduct } from "@/lib/services/products";
import { createOffer, setOfferActive } from "@/lib/services/offers";
import { prisma } from "@/lib/prisma";
import { createTestAdmin, createTestMarketplace, uniqueTitle } from "./helpers";
import { GET } from "@/app/sair/[offerId]/route";

let adminId: string;
let marketplaceId: string;

beforeAll(async () => {
  const admin = await createTestAdmin();
  adminId = admin.id;
  const marketplace = await createTestMarketplace({ allowedHosts: "loja-redirect-teste.com.br" });
  marketplaceId = marketplace.id;
});

async function buildPublishedProductWithOffer(overrides: { active?: boolean } = {}) {
  const title = uniqueTitle("Produto Redirect");
  const product = await createProduct(
    { title, shortDescription: "Resumo válido com dez chars", description: "Descrição válida com vinte caracteres" },
    adminId,
  );
  await prisma.productMedia.create({
    data: { productId: product.id, type: "IMAGE", url: "https://placehold.co/1.png", position: 0 },
  });
  const offer = await createOffer({
    productId: product.id,
    marketplaceId,
    destinationUrl: "https://loja-redirect-teste.com.br/produto",
    affiliateUrl: "https://loja-redirect-teste.com.br/produto?afiliado=vitrivo",
    isPrimary: true,
    active: true,
  });
  await publishProduct(product.id, adminId);
  if (overrides.active === false) {
    await setOfferActive(offer.id, false);
  }
  return { product, offer };
}

describe("/sair/[offerId] — redirecionamento afiliado (integração)", () => {
  it("redireciona para a affiliateUrl da oferta (nunca a destinationUrl)", async () => {
    const { offer } = await buildPublishedProductWithOffer();
    const request = new NextRequest(`http://localhost:3000/sair/${offer.id}`);

    const response = await GET(request, { params: Promise.resolve({ offerId: offer.id }) });

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(offer.affiliateUrl);
  });

  it("registra o clique de saída ao redirecionar", async () => {
    const { product, offer } = await buildPublishedProductWithOffer();
    const request = new NextRequest(`http://localhost:3000/sair/${offer.id}?from=%2Fproduto%2Fteste`, {
      headers: { "user-agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)" },
    });

    await GET(request, { params: Promise.resolve({ offerId: offer.id }) });

    const clicks = await prisma.outboundClick.findMany({ where: { offerId: offer.id } });
    expect(clicks.length).toBe(1);
    expect(clicks[0].productId).toBe(product.id);
    expect(clicks[0].deviceClass).toBe("mobile");
    expect(clicks[0].landingPath).toBe("/produto/teste");
  });

  it("não redireciona (envia para /oferta-indisponivel) quando a oferta está inativa", async () => {
    const { offer } = await buildPublishedProductWithOffer({ active: false });
    const request = new NextRequest(`http://localhost:3000/sair/${offer.id}`);

    const response = await GET(request, { params: Promise.resolve({ offerId: offer.id }) });

    expect(response.headers.get("location")).toContain("/oferta-indisponivel");
  });

  it("não redireciona para oferta inexistente", async () => {
    const request = new NextRequest("http://localhost:3000/sair/id-inexistente-123");
    const response = await GET(request, { params: Promise.resolve({ offerId: "id-inexistente-123" }) });
    expect(response.headers.get("location")).toContain("/oferta-indisponivel");
  });
});
