/**
 * Popula o banco usado pelos testes E2E (Playwright). Deve rodar com
 * DATABASE_URL apontando para prisma/e2e.db (ver playwright.config.ts), e
 * DEPOIS de `prisma db push` ter criado o schema nesse banco.
 */
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import {
  E2E_ADMIN_EMAIL,
  E2E_ADMIN_PASSWORD,
  E2E_MARKETPLACE_ALLOWED_HOST,
  E2E_PUBLISHED_PRODUCT_SLUG,
  E2E_PUBLISHED_PRODUCT_TITLE,
  E2E_OFFER_ID,
} from "../tests/e2e/fixtures";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash(E2E_ADMIN_PASSWORD, 10);
  await prisma.adminUser.upsert({
    where: { email: E2E_ADMIN_EMAIL },
    update: {},
    create: { name: "Admin E2E", email: E2E_ADMIN_EMAIL, passwordHash, role: "ADMIN" },
  });

  const marketplace = await prisma.marketplace.upsert({
    where: { slug: "marketplace-e2e" },
    update: {},
    create: {
      name: "Marketplace E2E",
      slug: "marketplace-e2e",
      allowedHosts: E2E_MARKETPLACE_ALLOWED_HOST,
      active: true,
    },
  });

  const category = await prisma.category.upsert({
    where: { slug: "categoria-e2e" },
    update: {},
    create: { name: "Categoria E2E", slug: "categoria-e2e", active: true },
  });

  const product = await prisma.product.upsert({
    where: { slug: E2E_PUBLISHED_PRODUCT_SLUG },
    update: {},
    create: {
      title: E2E_PUBLISHED_PRODUCT_TITLE,
      slug: E2E_PUBLISHED_PRODUCT_SLUG,
      shortDescription: "Produto publicado usado nos testes end-to-end.",
      description: "Descrição completa do produto publicado usado nos testes automatizados de ponta a ponta.",
      status: "PUBLISHED",
      publishedAt: new Date(),
      categoryId: category.id,
    },
  });

  await prisma.offer.upsert({
    where: { id: E2E_OFFER_ID },
    update: {},
    create: {
      id: E2E_OFFER_ID,
      productId: product.id,
      marketplaceId: marketplace.id,
      destinationUrl: `https://${E2E_MARKETPLACE_ALLOWED_HOST}/produto-e2e`,
      affiliateUrl: `https://${E2E_MARKETPLACE_ALLOWED_HOST}/produto-e2e?afiliado=e2e`,
      referencePrice: 99.9,
      currency: "BRL",
      isPrimary: true,
      active: true,
    },
  });

  await prisma.contentPage.upsert({
    where: { slug: "politica-de-privacidade" },
    update: {},
    create: {
      slug: "politica-de-privacidade",
      title: "Política de Privacidade",
      body: "Conteúdo de teste da política de privacidade.",
      type: "PAGE",
      status: "PUBLISHED",
      publishedAt: new Date(),
    },
  });

  console.log("Banco de testes E2E populado.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
