import "server-only";
import { prisma } from "@/lib/prisma";
import { offerInputSchema, type OfferInput } from "@/lib/validation/offer";
import { parseAllowedHosts, validateAffiliateUrl } from "@/lib/redirect/allowlist";
import { getExtraAllowedHosts } from "@/config/env";

async function assertUrlsAllowed(marketplaceId: string, affiliateUrl: string, destinationUrl: string) {
  const marketplace = await prisma.marketplace.findUnique({ where: { id: marketplaceId } });
  if (!marketplace) throw new Error("Marketplace não encontrado.");
  const allowedHosts = [...parseAllowedHosts(marketplace.allowedHosts), ...getExtraAllowedHosts()];

  const affiliateCheck = validateAffiliateUrl(affiliateUrl, allowedHosts);
  if (!affiliateCheck.ok) {
    throw new Error(
      `URL de afiliado não permitida para o marketplace "${marketplace.name}". Domínios liberados: ${marketplace.allowedHosts}`,
    );
  }
  const destinationCheck = validateAffiliateUrl(destinationUrl, allowedHosts);
  if (!destinationCheck.ok) {
    throw new Error(
      `URL de destino não permitida para o marketplace "${marketplace.name}". Domínios liberados: ${marketplace.allowedHosts}`,
    );
  }
}

export async function listOffersByProduct(productId: string) {
  return prisma.offer.findMany({
    where: { productId },
    orderBy: [{ isPrimary: "desc" }, { position: "asc" }],
    include: { marketplace: true },
  });
}

export async function listAllOffersAdmin() {
  return prisma.offer.findMany({
    orderBy: [{ createdAt: "desc" }],
    include: { marketplace: true, product: { select: { id: true, title: true, slug: true, status: true } } },
  });
}

export async function createOffer(rawInput: unknown) {
  const input: OfferInput = offerInputSchema.parse(rawInput);
  await assertUrlsAllowed(input.marketplaceId, input.affiliateUrl, input.destinationUrl);

  return prisma.$transaction(async (tx) => {
    if (input.isPrimary) {
      await tx.offer.updateMany({ where: { productId: input.productId }, data: { isPrimary: false } });
    }
    return tx.offer.create({
      data: {
        productId: input.productId,
        marketplaceId: input.marketplaceId,
        destinationUrl: input.destinationUrl,
        affiliateUrl: input.affiliateUrl,
        referencePrice: input.referencePrice ?? null,
        currency: input.currency,
        label: input.label,
        notes: input.notes,
        isPrimary: input.isPrimary,
        active: input.active,
        position: input.position,
      },
    });
  });
}

export async function updateOffer(id: string, rawInput: unknown) {
  const input: OfferInput = offerInputSchema.parse(rawInput);
  await assertUrlsAllowed(input.marketplaceId, input.affiliateUrl, input.destinationUrl);

  return prisma.$transaction(async (tx) => {
    if (input.isPrimary) {
      await tx.offer.updateMany({
        where: { productId: input.productId, NOT: { id } },
        data: { isPrimary: false },
      });
    }
    return tx.offer.update({
      where: { id },
      data: {
        marketplaceId: input.marketplaceId,
        destinationUrl: input.destinationUrl,
        affiliateUrl: input.affiliateUrl,
        referencePrice: input.referencePrice ?? null,
        currency: input.currency,
        label: input.label,
        notes: input.notes,
        isPrimary: input.isPrimary,
        active: input.active,
        position: input.position,
      },
    });
  });
}

export async function setPrimaryOffer(productId: string, offerId: string) {
  return prisma.$transaction([
    prisma.offer.updateMany({ where: { productId }, data: { isPrimary: false } }),
    prisma.offer.update({ where: { id: offerId }, data: { isPrimary: true } }),
  ]);
}

export async function setOfferActive(offerId: string, active: boolean) {
  return prisma.offer.update({ where: { id: offerId }, data: { active } });
}

export async function markOfferChecked(offerId: string) {
  return prisma.offer.update({ where: { id: offerId }, data: { lastCheckedAt: new Date() } });
}

export async function reorderOffers(productId: string, orderedIds: string[]) {
  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.offer.update({ where: { id }, data: { position: index } }),
    ),
  );
}

export async function deleteOffer(id: string) {
  return prisma.offer.delete({ where: { id } });
}

export async function getOfferForRedirect(offerId: string) {
  return prisma.offer.findUnique({
    where: { id: offerId },
    include: { marketplace: true, product: { select: { id: true, slug: true, status: true } } },
  });
}
