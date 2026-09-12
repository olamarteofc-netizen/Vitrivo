import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories, pages] = await Promise.all([
    prisma.product.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } }),
    prisma.category.findMany({ where: { active: true }, select: { slug: true, updatedAt: true } }),
    prisma.contentPage.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, type: true, updatedAt: true },
    }),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteConfig.url, changeFrequency: "daily", priority: 1 },
    { url: `${siteConfig.url}/produtos`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteConfig.url}/buscar`, changeFrequency: "weekly", priority: 0.3 },
    { url: `${siteConfig.url}/sobre`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${siteConfig.url}/contato`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${siteConfig.url}/politica-de-privacidade`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${siteConfig.url}/termos-de-uso`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${siteConfig.url}/politica-de-cookies`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${siteConfig.url}/transparencia-de-afiliados`, changeFrequency: "yearly", priority: 0.2 },
  ];

  if (siteConfig.features.guides) {
    staticRoutes.push({ url: `${siteConfig.url}/guias`, changeFrequency: "weekly", priority: 0.5 });
  }

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${siteConfig.url}/produto/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${siteConfig.url}/categoria/${c.slug}`,
    lastModified: c.updatedAt,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const guideRoutes: MetadataRoute.Sitemap = pages
    .filter((p) => p.type === "GUIDE")
    .map((p) => ({
      url: `${siteConfig.url}/guias/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "monthly",
      priority: 0.5,
    }));

  return [...staticRoutes, ...productRoutes, ...categoryRoutes, ...guideRoutes];
}
