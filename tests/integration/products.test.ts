import { describe, it, expect, beforeAll } from "vitest";
import { prisma } from "@/lib/prisma";
import {
  createProduct,
  updateProduct,
  publishProduct,
  archiveProduct,
  duplicateProduct,
  listPublicProducts,
  listProductsAdmin,
} from "@/lib/services/products";
import { createOffer } from "@/lib/services/offers";
import { createTestAdmin, createTestMarketplace, uniqueTitle } from "./helpers";

let adminId: string;
let marketplaceId: string;

beforeAll(async () => {
  const admin = await createTestAdmin();
  adminId = admin.id;
  const marketplace = await createTestMarketplace();
  marketplaceId = marketplace.id;
});

describe("products service — CRUD e publicação (integração)", () => {
  it("cria um produto como rascunho por padrão", async () => {
    const title = uniqueTitle("Produto CRUD");
    const product = await createProduct(
      { title, shortDescription: "Resumo do produto de teste", description: "Descrição completa do produto de teste com detalhes" },
      adminId,
    );
    expect(product.status).toBe("DRAFT");
    expect(product.slug).toBeTruthy();
  });

  it("gera slugs únicos para títulos duplicados", async () => {
    const title = uniqueTitle("Produto Slug Duplicado");
    const p1 = await createProduct({ title, shortDescription: "Resumo 1234567890", description: "Descrição bem completa aqui" }, adminId);
    const p2 = await createProduct({ title, shortDescription: "Resumo 1234567890", description: "Descrição bem completa aqui" }, adminId);
    expect(p1.slug).not.toBe(p2.slug);
  });

  it("não publica produto sem oferta ativa", async () => {
    const title = uniqueTitle("Produto Sem Oferta");
    const product = await createProduct(
      { title, shortDescription: "Resumo válido com dez chars", description: "Descrição válida com vinte caracteres" },
      adminId,
    );
    await expect(publishProduct(product.id, adminId)).rejects.toThrow(/oferta ativa/i);
  });

  it("publica produto com ao menos uma oferta ativa e o remove de rascunhos", async () => {
    const title = uniqueTitle("Produto Publicável");
    const product = await createProduct(
      { title, shortDescription: "Resumo válido com dez chars", description: "Descrição válida com vinte caracteres" },
      adminId,
    );
    await createOffer({
      productId: product.id,
      marketplaceId,
      destinationUrl: "https://loja-parceira-teste.com.br/produto",
      affiliateUrl: "https://loja-parceira-teste.com.br/produto?ref=1",
      isPrimary: true,
      active: true,
    });

    const published = await publishProduct(product.id, adminId);
    expect(published.status).toBe("PUBLISHED");
    expect(published.publishedAt).not.toBeNull();

    const publicList = await listPublicProducts({ search: title });
    expect(publicList.items.some((p) => p.id === product.id)).toBe(true);
  });

  it("arquivar remove o produto das listagens públicas", async () => {
    const title = uniqueTitle("Produto Para Arquivar");
    const product = await createProduct(
      { title, shortDescription: "Resumo válido com dez chars", description: "Descrição válida com vinte caracteres" },
      adminId,
    );
    await createOffer({
      productId: product.id,
      marketplaceId,
      destinationUrl: "https://loja-parceira-teste.com.br/produto2",
      affiliateUrl: "https://loja-parceira-teste.com.br/produto2?ref=1",
      isPrimary: true,
      active: true,
    });
    await publishProduct(product.id, adminId);

    let publicList = await listPublicProducts({ search: title });
    expect(publicList.items.some((p) => p.id === product.id)).toBe(true);

    await archiveProduct(product.id, adminId);

    publicList = await listPublicProducts({ search: title });
    expect(publicList.items.some((p) => p.id === product.id)).toBe(false);

    const adminList = await listProductsAdmin({ search: title, status: "ARCHIVED" });
    expect(adminList.items.some((p) => p.id === product.id)).toBe(true);
  });

  it("editar o produto não altera a URL pública quando o slug não é alterado", async () => {
    const title = uniqueTitle("Produto Estável");
    const product = await createProduct(
      { title, shortDescription: "Resumo válido com dez chars", description: "Descrição válida com vinte caracteres" },
      adminId,
    );
    const updated = await updateProduct(
      product.id,
      { title, shortDescription: "Resumo atualizado com dez chars", description: "Descrição também atualizada aqui" },
      adminId,
    );
    expect(updated.slug).toBe(product.slug);
  });

  it("duplicar um produto copia mídia e ofertas com um novo slug", async () => {
    const title = uniqueTitle("Produto Original");
    const original = await createProduct(
      { title, shortDescription: "Resumo válido com dez chars", description: "Descrição válida com vinte caracteres" },
      adminId,
    );
    await prisma.productMedia.create({
      data: { productId: original.id, type: "IMAGE", url: "https://placehold.co/1.png", position: 0 },
    });
    await createOffer({
      productId: original.id,
      marketplaceId,
      destinationUrl: "https://loja-parceira-teste.com.br/produto3",
      affiliateUrl: "https://loja-parceira-teste.com.br/produto3?ref=1",
      isPrimary: true,
      active: true,
    });

    const copy = await duplicateProduct(original.id, adminId);
    expect(copy.id).not.toBe(original.id);
    expect(copy.slug).not.toBe(original.slug);
    expect(copy.status).toBe("DRAFT");

    const copyFull = await prisma.product.findUnique({
      where: { id: copy.id },
      include: { media: true, offers: true },
    });
    expect(copyFull?.media.length).toBe(1);
    expect(copyFull?.offers.length).toBe(1);
  });
});
