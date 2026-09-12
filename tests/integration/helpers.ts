import { prisma } from "@/lib/prisma";

let counter = 0;
function uniqueSuffix() {
  counter += 1;
  return `${Date.now()}-${counter}`;
}

export async function createTestAdmin() {
  return prisma.adminUser.create({
    data: {
      name: "Admin de Teste",
      email: `admin-${uniqueSuffix()}@teste.local`,
      passwordHash: "hash-fake-para-teste",
      role: "ADMIN",
    },
  });
}

export async function createTestMarketplace(overrides: { allowedHosts?: string } = {}) {
  const suffix = uniqueSuffix();
  return prisma.marketplace.create({
    data: {
      name: `Marketplace Teste ${suffix}`,
      slug: `marketplace-teste-${suffix}`,
      allowedHosts: overrides.allowedHosts ?? "loja-parceira-teste.com.br",
      active: true,
    },
  });
}

export async function createTestCategory() {
  const suffix = uniqueSuffix();
  return prisma.category.create({
    data: { name: `Categoria Teste ${suffix}`, slug: `categoria-teste-${suffix}` },
  });
}

export function uniqueTitle(base: string) {
  return `${base} ${uniqueSuffix()}`;
}
