import "server-only";
import { prisma } from "@/lib/prisma";
import { uniqueSlug } from "@/lib/slug";
import { productInputSchema, type ProductInput } from "@/lib/validation/product";
import { checkProductPublishable } from "@/lib/domain/publish-rules";
import { logAudit } from "@/lib/audit";
import type { ProductStatus, SortOption } from "@/types";
import type { Prisma } from "@prisma/client";

const PAGE_SIZE = 12;

function serializeBenefits(benefits: string[] | undefined): string | null {
  return benefits && benefits.length > 0 ? JSON.stringify(benefits) : null;
}

function serializeSpecifications(specs: { label: string; value: string }[] | undefined): string | null {
  return specs && specs.length > 0 ? JSON.stringify(specs) : null;
}

export function parseBenefits(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

export function parseSpecifications(raw: string | null): { label: string; value: string }[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (v): v is { label: string; value: string } =>
        typeof v === "object" && v !== null && typeof (v as { label?: unknown }).label === "string",
    );
  } catch {
    return [];
  }
}

async function uniqueSlugForProduct(base: string, excludeId?: string): Promise<string> {
  const existing = await prisma.product.findMany({ select: { id: true, slug: true } });
  const taken = new Set(existing.filter((p) => p.id !== excludeId).map((p) => p.slug));
  return uniqueSlug(base, (candidate) => taken.has(candidate));
}

async function syncProductTags(tx: Prisma.TransactionClient, productId: string, tagIds: string[]) {
  await tx.productTag.deleteMany({ where: { productId } });
  const uniqueTagIds = [...new Set(tagIds)];
  if (uniqueTagIds.length > 0) {
    await tx.productTag.createMany({
      data: uniqueTagIds.map((tagId) => ({ productId, tagId })),
    });
  }
}

const PRODUCT_CARD_INCLUDE = {
  category: true,
  media: { orderBy: { position: "asc" as const } },
  offers: { where: { active: true }, include: { marketplace: true }, orderBy: { position: "asc" as const } },
};

export async function createProduct(rawInput: unknown, adminUserId: string) {
  const input: ProductInput = productInputSchema.parse(rawInput);
  const slug = await uniqueSlugForProduct(input.slug ?? input.title);

  const product = await prisma.$transaction(async (tx) => {
    const created = await tx.product.create({
      data: {
        title: input.title,
        slug,
        shortDescription: input.shortDescription,
        description: input.description,
        benefits: serializeBenefits(input.benefits),
        howItWorks: input.howItWorks,
        specifications: serializeSpecifications(input.specifications),
        warnings: input.warnings,
        categoryId: input.categoryId || null,
        featured: input.featured,
        seoTitle: input.seoTitle,
        seoDescription: input.seoDescription,
        status: "DRAFT",
      },
    });
    await syncProductTags(tx, created.id, input.tagIds);
    return created;
  });

  await logAudit({
    adminUserId,
    action: "product.create",
    entityType: "Product",
    entityId: product.id,
    metadata: { title: product.title },
  });
  return product;
}

export async function updateProduct(id: string, rawInput: unknown, adminUserId: string) {
  const input: ProductInput = productInputSchema.parse(rawInput);
  const slug = await uniqueSlugForProduct(input.slug ?? input.title, id);

  const product = await prisma.$transaction(async (tx) => {
    const updated = await tx.product.update({
      where: { id },
      data: {
        title: input.title,
        slug,
        shortDescription: input.shortDescription,
        description: input.description,
        benefits: serializeBenefits(input.benefits),
        howItWorks: input.howItWorks,
        specifications: serializeSpecifications(input.specifications),
        warnings: input.warnings,
        categoryId: input.categoryId || null,
        featured: input.featured,
        seoTitle: input.seoTitle,
        seoDescription: input.seoDescription,
      },
    });
    await syncProductTags(tx, id, input.tagIds);
    return updated;
  });

  await logAudit({
    adminUserId,
    action: "product.update",
    entityType: "Product",
    entityId: product.id,
    metadata: { title: product.title },
  });
  return product;
}

export async function duplicateProduct(id: string, adminUserId: string) {
  const original = await prisma.product.findUnique({
    where: { id },
    include: { media: true, tags: true, offers: true },
  });
  if (!original) throw new Error("Produto não encontrado.");

  const newSlug = await uniqueSlugForProduct(`${original.slug}-copia`);

  const copy = await prisma.$transaction(async (tx) => {
    const created = await tx.product.create({
      data: {
        title: `${original.title} (cópia)`,
        slug: newSlug,
        shortDescription: original.shortDescription,
        description: original.description,
        benefits: original.benefits,
        howItWorks: original.howItWorks,
        specifications: original.specifications,
        warnings: original.warnings,
        categoryId: original.categoryId,
        featured: false,
        seoTitle: original.seoTitle,
        seoDescription: original.seoDescription,
        status: "DRAFT",
      },
    });
    if (original.media.length > 0) {
      await tx.productMedia.createMany({
        data: original.media.map((m) => ({
          productId: created.id,
          type: m.type,
          url: m.url,
          altText: m.altText,
          position: m.position,
        })),
      });
    }
    if (original.tags.length > 0) {
      await tx.productTag.createMany({
        data: original.tags.map((t) => ({ productId: created.id, tagId: t.tagId })),
      });
    }
    if (original.offers.length > 0) {
      await tx.offer.createMany({
        data: original.offers.map((o) => ({
          productId: created.id,
          marketplaceId: o.marketplaceId,
          destinationUrl: o.destinationUrl,
          affiliateUrl: o.affiliateUrl,
          referencePrice: o.referencePrice,
          currency: o.currency,
          label: o.label,
          notes: o.notes,
          isPrimary: o.isPrimary,
          active: o.active,
          position: o.position,
        })),
      });
    }
    return created;
  });

  await logAudit({
    adminUserId,
    action: "product.duplicate",
    entityType: "Product",
    entityId: copy.id,
    metadata: { sourceId: id },
  });
  return copy;
}

export async function setFeatured(id: string, featured: boolean, adminUserId: string) {
  const product = await prisma.product.update({ where: { id }, data: { featured } });
  await logAudit({
    adminUserId,
    action: featured ? "product.feature" : "product.unfeature",
    entityType: "Product",
    entityId: id,
  });
  return product;
}

export async function publishProduct(id: string, adminUserId: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: { offers: { where: { active: true } }, media: true },
  });
  if (!product) throw new Error("Produto não encontrado.");

  const check = checkProductPublishable({
    title: product.title,
    slug: product.slug,
    shortDescription: product.shortDescription,
    description: product.description,
    activeOfferCount: product.offers.length,
    mediaCount: product.media.length,
  });
  if (!check.canPublish) {
    throw new Error(check.reasons.join(" "));
  }

  const updated = await prisma.product.update({
    where: { id },
    data: { status: "PUBLISHED", publishedAt: product.publishedAt ?? new Date() },
  });
  await logAudit({ adminUserId, action: "product.publish", entityType: "Product", entityId: id });
  return updated;
}

export async function archiveProduct(id: string, adminUserId: string) {
  const updated = await prisma.product.update({ where: { id }, data: { status: "ARCHIVED" } });
  await logAudit({ adminUserId, action: "product.archive", entityType: "Product", entityId: id });
  return updated;
}

export async function backToDraft(id: string, adminUserId: string) {
  const updated = await prisma.product.update({ where: { id }, data: { status: "DRAFT" } });
  await logAudit({ adminUserId, action: "product.draft", entityType: "Product", entityId: id });
  return updated;
}

export async function getProductByIdAdmin(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      media: { orderBy: { position: "asc" } },
      tags: { include: { tag: true } },
      offers: { include: { marketplace: true }, orderBy: [{ isPrimary: "desc" }, { position: "asc" }] },
    },
  });
}

export type AdminProductFilters = {
  status?: ProductStatus | "ALL";
  search?: string;
  page?: number;
};

export async function listProductsAdmin(filters: AdminProductFilters = {}) {
  const page = Math.max(1, filters.page ?? 1);
  const where: Prisma.ProductWhereInput = {};
  if (filters.status && filters.status !== "ALL") where.status = filters.status;
  if (filters.search) {
    where.title = { contains: filters.search };
  }
  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true, _count: { select: { offers: true } } },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.product.count({ where }),
  ]);
  return { items, total, page, pageSize: PAGE_SIZE, pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export type PublicProductFilters = {
  categorySlug?: string;
  marketplaceSlug?: string;
  tagSlug?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: SortOption;
  page?: number;
};

function buildPublicWhere(filters: PublicProductFilters): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = { status: "PUBLISHED" };
  if (filters.categorySlug) {
    where.category = { slug: filters.categorySlug };
  }
  if (filters.tagSlug) {
    where.tags = { some: { tag: { slug: filters.tagSlug } } };
  }
  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search } },
      { shortDescription: { contains: filters.search } },
    ];
  }
  const offerFilter: Prisma.OfferWhereInput = { active: true };
  if (filters.marketplaceSlug) {
    offerFilter.marketplace = { slug: filters.marketplaceSlug };
  }
  if (filters.minPrice !== undefined) {
    offerFilter.referencePrice = { ...(offerFilter.referencePrice as object), gte: filters.minPrice };
  }
  if (filters.maxPrice !== undefined) {
    offerFilter.referencePrice = { ...(offerFilter.referencePrice as object), lte: filters.maxPrice };
  }
  if (filters.marketplaceSlug || filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.offers = { some: offerFilter };
  }
  return where;
}

function buildOrderBy(sort: SortOption | undefined): Prisma.ProductOrderByWithRelationInput[] {
  switch (sort) {
    case "recentes":
      return [{ publishedAt: "desc" }];
    case "populares":
      return [{ clicks: { _count: "desc" } }];
    case "destaque":
    default:
      return [{ featured: "desc" }, { publishedAt: "desc" }];
  }
}

export async function listPublicProducts(filters: PublicProductFilters = {}) {
  const page = Math.max(1, filters.page ?? 1);
  const where = buildPublicWhere(filters);
  const orderBy = buildOrderBy(filters.sort);

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: PRODUCT_CARD_INCLUDE,
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.product.count({ where }),
  ]);
  return { items, total, page, pageSize: PAGE_SIZE, pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export async function listFeaturedProducts(limit = 8) {
  return prisma.product.findMany({
    where: { status: "PUBLISHED", featured: true },
    include: PRODUCT_CARD_INCLUDE,
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
}

export async function listRecentProducts(limit = 8) {
  return prisma.product.findMany({
    where: { status: "PUBLISHED" },
    include: PRODUCT_CARD_INCLUDE,
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
}

export async function getProductBySlugPublic(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      media: { orderBy: { position: "asc" } },
      tags: { include: { tag: true } },
      offers: { include: { marketplace: true }, orderBy: [{ isPrimary: "desc" }, { position: "asc" } as const] },
    },
  });
}

export async function getRelatedProducts(product: { id: string; categoryId: string | null }, limit = 4) {
  if (!product.categoryId) return [];
  return prisma.product.findMany({
    where: {
      status: "PUBLISHED",
      categoryId: product.categoryId,
      NOT: { id: product.id },
    },
    include: PRODUCT_CARD_INCLUDE,
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
}

// ---------------------------------------------------------------------------
// Mídia
// ---------------------------------------------------------------------------

export async function addProductMedia(
  productId: string,
  data: { type: "IMAGE" | "VIDEO"; url: string; altText?: string; position: number },
  adminUserId: string,
) {
  const media = await prisma.productMedia.create({ data: { productId, ...data } });
  await logAudit({ adminUserId, action: "product.media.add", entityType: "Product", entityId: productId });
  return media;
}

export async function removeProductMedia(mediaId: string, productId: string, adminUserId: string) {
  await prisma.productMedia.delete({ where: { id: mediaId } });
  await logAudit({ adminUserId, action: "product.media.remove", entityType: "Product", entityId: productId });
}

export async function updateProductMediaAltText(
  mediaId: string,
  productId: string,
  altText: string,
  adminUserId: string,
) {
  await prisma.productMedia.update({ where: { id: mediaId }, data: { altText: altText || null } });
  await logAudit({ adminUserId, action: "product.media.update", entityType: "Product", entityId: productId });
}

/** Move a mídia para a posição 0 (capa), preservando a ordem relativa das demais. */
export async function setCoverProductMedia(productId: string, mediaId: string) {
  const media = await prisma.productMedia.findMany({
    where: { productId },
    orderBy: { position: "asc" },
    select: { id: true },
  });
  const ids = media.map((m) => m.id);
  const index = ids.indexOf(mediaId);
  if (index <= 0) return;
  ids.splice(index, 1);
  ids.unshift(mediaId);
  await reorderProductMedia(productId, ids);
}

export async function reorderProductMedia(productId: string, orderedIds: string[]) {
  await prisma.$transaction(
    orderedIds.map((id, index) => prisma.productMedia.update({ where: { id }, data: { position: index } })),
  );
}
