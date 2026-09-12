import "server-only";
import { prisma } from "@/lib/prisma";
import { uniqueSlug } from "@/lib/slug";
import { marketplaceInputSchema, type MarketplaceInput } from "@/lib/validation/marketplace";

export async function listMarketplaces() {
  return prisma.marketplace.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { offers: true } } },
  });
}

export async function listActiveMarketplaces() {
  return prisma.marketplace.findMany({ where: { active: true }, orderBy: { name: "asc" } });
}

export async function getMarketplaceById(id: string) {
  return prisma.marketplace.findUnique({ where: { id } });
}

async function uniqueSlugForMarketplace(base: string, excludeId?: string): Promise<string> {
  const existing = await prisma.marketplace.findMany({ select: { id: true, slug: true } });
  const taken = new Set(existing.filter((m) => m.id !== excludeId).map((m) => m.slug));
  return uniqueSlug(base, (candidate) => taken.has(candidate));
}

export async function createMarketplace(rawInput: unknown) {
  const input: MarketplaceInput = marketplaceInputSchema.parse(rawInput);
  const slug = await uniqueSlugForMarketplace(input.slug ?? input.name);
  return prisma.marketplace.create({
    data: {
      name: input.name,
      slug,
      logoUrl: input.logoUrl,
      disclosureText: input.disclosureText,
      allowedHosts: input.allowedHosts.join(","),
      active: input.active,
    },
  });
}

export async function updateMarketplace(id: string, rawInput: unknown) {
  const input: MarketplaceInput = marketplaceInputSchema.parse(rawInput);
  const slug = await uniqueSlugForMarketplace(input.slug ?? input.name, id);
  return prisma.marketplace.update({
    where: { id },
    data: {
      name: input.name,
      slug,
      logoUrl: input.logoUrl,
      disclosureText: input.disclosureText,
      allowedHosts: input.allowedHosts.join(","),
      active: input.active,
    },
  });
}

export async function setMarketplaceActive(id: string, active: boolean) {
  return prisma.marketplace.update({ where: { id }, data: { active } });
}

export async function deleteMarketplace(id: string) {
  const count = await prisma.offer.count({ where: { marketplaceId: id } });
  if (count > 0) {
    throw new Error("Não é possível excluir um marketplace que possui ofertas vinculadas.");
  }
  return prisma.marketplace.delete({ where: { id } });
}
