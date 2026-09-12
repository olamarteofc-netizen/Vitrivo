import "server-only";
import { prisma } from "@/lib/prisma";
import type { DeviceClass } from "@/types";
import type { UtmParams } from "@/lib/utm";

export type RecordClickInput = {
  offerId: string;
  productId: string;
  sessionId: string;
  referrer?: string | null;
  landingPath?: string | null;
  deviceClass: DeviceClass;
  utm: UtmParams;
};

export async function recordOutboundClick(input: RecordClickInput) {
  return prisma.outboundClick.create({
    data: {
      offerId: input.offerId,
      productId: input.productId,
      sessionId: input.sessionId,
      referrer: input.referrer ?? null,
      landingPath: input.landingPath ?? null,
      deviceClass: input.deviceClass,
      utmSource: input.utm.utmSource ?? null,
      utmMedium: input.utm.utmMedium ?? null,
      utmCampaign: input.utm.utmCampaign ?? null,
      utmContent: input.utm.utmContent ?? null,
      utmTerm: input.utm.utmTerm ?? null,
    },
  });
}

export type AnalyticsRange = "7d" | "30d" | "90d" | "all";

function rangeToDate(range: AnalyticsRange): Date | undefined {
  if (range === "all") return undefined;
  const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

export async function getClickStats(range: AnalyticsRange = "30d") {
  const since = rangeToDate(range);
  const where = since ? { occurredAt: { gte: since } } : {};

  const [total, byProductRaw, byMarketplaceRaw, byCampaignRaw, bySourceRaw, recent] = await Promise.all([
    prisma.outboundClick.count({ where }),
    prisma.outboundClick.groupBy({
      by: ["productId"],
      where,
      _count: { productId: true },
      orderBy: { _count: { productId: "desc" } },
      take: 10,
    }),
    prisma.outboundClick.findMany({
      where,
      select: { offer: { select: { marketplace: { select: { id: true, name: true } } } } },
    }),
    prisma.outboundClick.groupBy({
      by: ["utmCampaign"],
      where: { ...where, utmCampaign: { not: null } },
      _count: { utmCampaign: true },
      orderBy: { _count: { utmCampaign: "desc" } },
      take: 10,
    }),
    prisma.outboundClick.groupBy({
      by: ["utmSource"],
      where: { ...where, utmSource: { not: null } },
      _count: { utmSource: true },
      orderBy: { _count: { utmSource: "desc" } },
      take: 10,
    }),
    prisma.outboundClick.findMany({
      where,
      orderBy: { occurredAt: "desc" },
      take: 20,
      include: {
        product: { select: { title: true, slug: true } },
        offer: { select: { id: true, marketplace: { select: { name: true } } } },
      },
    }),
  ]);

  const productIds = byProductRaw.map((r) => r.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, title: true, slug: true },
  });
  const productMap = new Map(products.map((p) => [p.id, p]));
  const byProduct = byProductRaw.map((r) => ({
    product: productMap.get(r.productId) ?? null,
    count: r._count.productId,
  }));

  const marketplaceCounts = new Map<string, { name: string; count: number }>();
  for (const row of byMarketplaceRaw) {
    const mp = row.offer?.marketplace;
    if (!mp) continue;
    const current = marketplaceCounts.get(mp.id) ?? { name: mp.name, count: 0 };
    current.count += 1;
    marketplaceCounts.set(mp.id, current);
  }
  const byMarketplace = [...marketplaceCounts.values()].sort((a, b) => b.count - a.count);

  return {
    total,
    byProduct,
    byMarketplace,
    byCampaign: byCampaignRaw.map((r) => ({ campaign: r.utmCampaign, count: r._count.utmCampaign })),
    bySource: bySourceRaw.map((r) => ({ source: r.utmSource, count: r._count.utmSource })),
    recent,
  };
}

export async function exportClicksCsv(range: AnalyticsRange = "all"): Promise<string> {
  const since = rangeToDate(range);
  const where = since ? { occurredAt: { gte: since } } : {};
  const clicks = await prisma.outboundClick.findMany({
    where,
    orderBy: { occurredAt: "desc" },
    include: {
      product: { select: { title: true, slug: true } },
      offer: { select: { marketplace: { select: { name: true } } } },
    },
  });

  const header = [
    "occurredAt",
    "product",
    "productSlug",
    "marketplace",
    "utmSource",
    "utmMedium",
    "utmCampaign",
    "utmContent",
    "utmTerm",
    "deviceClass",
    "referrer",
  ];
  const escape = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const rows = clicks.map((c) =>
    [
      c.occurredAt.toISOString(),
      c.product.title,
      c.product.slug,
      c.offer.marketplace.name,
      c.utmSource,
      c.utmMedium,
      c.utmCampaign,
      c.utmContent,
      c.utmTerm,
      c.deviceClass,
      c.referrer,
    ]
      .map(escape)
      .join(","),
  );
  return [header.join(","), ...rows].join("\n");
}
