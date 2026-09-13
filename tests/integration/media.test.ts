import { describe, it, expect, beforeAll } from "vitest";
import { prisma } from "@/lib/prisma";
import {
  createProduct,
  addProductMedia,
  removeProductMedia,
  reorderProductMedia,
  updateProductMediaAltText,
  setCoverProductMedia,
} from "@/lib/services/products";
import { createTestAdmin, uniqueTitle } from "./helpers";

let adminId: string;

beforeAll(async () => {
  const admin = await createTestAdmin();
  adminId = admin.id;
});

async function buildProduct() {
  const product = await createProduct(
    {
      title: uniqueTitle("Produto Mídia"),
      shortDescription: "Resumo válido com dez chars",
      description: "Descrição válida com vinte caracteres",
    },
    adminId,
  );
  return product.id;
}

describe("mídia de produto (integração)", () => {
  it("adiciona mídia ao produto", async () => {
    const productId = await buildProduct();
    const media = await addProductMedia(
      productId,
      { type: "IMAGE", url: "https://blob.vercel-storage.com/foto-1.jpg", altText: "Foto 1" },
      adminId,
    );
    expect(media.id).toBeTruthy();
    expect(media.url).toContain("foto-1.jpg");
  });

  it("remove mídia do produto", async () => {
    const productId = await buildProduct();
    const media = await addProductMedia(
      productId,
      { type: "IMAGE", url: "https://blob.vercel-storage.com/foto-2.jpg" },
      adminId,
    );
    await removeProductMedia(media.id, productId, adminId);
    const found = await prisma.productMedia.findUnique({ where: { id: media.id } });
    expect(found).toBeNull();
  });

  it("reordena mídia do produto", async () => {
    const productId = await buildProduct();
    const m1 = await addProductMedia(productId, { type: "IMAGE", url: "https://x/a.jpg" }, adminId);
    const m2 = await addProductMedia(productId, { type: "IMAGE", url: "https://x/b.jpg" }, adminId);
    await reorderProductMedia(productId, [m2.id, m1.id]);
    const ordered = await prisma.productMedia.findMany({ where: { productId }, orderBy: { position: "asc" } });
    expect(ordered.map((m) => m.id)).toEqual([m2.id, m1.id]);
  });

  it("define uma mídia como capa (posição 0), preservando a ordem das demais", async () => {
    const productId = await buildProduct();
    const m1 = await addProductMedia(productId, { type: "IMAGE", url: "https://x/a.jpg" }, adminId);
    const m2 = await addProductMedia(productId, { type: "IMAGE", url: "https://x/b.jpg" }, adminId);
    const m3 = await addProductMedia(productId, { type: "IMAGE", url: "https://x/c.jpg" }, adminId);

    await setCoverProductMedia(productId, m3.id);

    const ordered = await prisma.productMedia.findMany({ where: { productId }, orderBy: { position: "asc" } });
    expect(ordered.map((m) => m.id)).toEqual([m3.id, m1.id, m2.id]);
  });

  it("atualiza o texto alternativo de uma mídia", async () => {
    const productId = await buildProduct();
    const media = await addProductMedia(productId, { type: "IMAGE", url: "https://x/a.jpg" }, adminId);
    await updateProductMediaAltText(media.id, productId, "Escova elétrica vista de frente", adminId);
    const updated = await prisma.productMedia.findUnique({ where: { id: media.id } });
    expect(updated?.altText).toBe("Escova elétrica vista de frente");
  });
});
