import "server-only";
import { prisma } from "@/lib/prisma";
import { uniqueSlug } from "@/lib/slug";
import { contentPageInputSchema, type ContentPageInput } from "@/lib/validation/content-page";
import { logAudit } from "@/lib/audit";
import type { ContentPageType } from "@/types";

async function uniqueSlugForContentPage(base: string, excludeId?: string): Promise<string> {
  const existing = await prisma.contentPage.findMany({ select: { id: true, slug: true } });
  const taken = new Set(existing.filter((p) => p.id !== excludeId).map((p) => p.slug));
  return uniqueSlug(base, (candidate) => taken.has(candidate));
}

export async function listContentPagesAdmin(type?: ContentPageType) {
  return prisma.contentPage.findMany({
    where: type ? { type } : undefined,
    orderBy: { updatedAt: "desc" },
  });
}

export async function getContentPageBySlug(slug: string) {
  return prisma.contentPage.findUnique({ where: { slug } });
}

export async function getContentPageById(id: string) {
  return prisma.contentPage.findUnique({ where: { id } });
}

export async function listPublishedGuides() {
  return prisma.contentPage.findMany({
    where: { type: "GUIDE", status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
  });
}

export async function createContentPage(rawInput: unknown, adminUserId: string) {
  const input: ContentPageInput = contentPageInputSchema.parse(rawInput);
  const slug = await uniqueSlugForContentPage(input.slug ?? input.title);
  const page = await prisma.contentPage.create({
    data: {
      title: input.title,
      slug,
      body: input.body,
      type: input.type,
      status: input.status,
      seoTitle: input.seoTitle,
      seoDescription: input.seoDescription,
      publishedAt: input.status === "PUBLISHED" ? new Date() : null,
    },
  });
  await logAudit({ adminUserId, action: "content.create", entityType: "ContentPage", entityId: page.id });
  return page;
}

export async function updateContentPage(id: string, rawInput: unknown, adminUserId: string) {
  const input: ContentPageInput = contentPageInputSchema.parse(rawInput);
  const slug = await uniqueSlugForContentPage(input.slug ?? input.title, id);
  const current = await prisma.contentPage.findUnique({ where: { id } });
  const page = await prisma.contentPage.update({
    where: { id },
    data: {
      title: input.title,
      slug,
      body: input.body,
      type: input.type,
      status: input.status,
      seoTitle: input.seoTitle,
      seoDescription: input.seoDescription,
      publishedAt:
        input.status === "PUBLISHED" ? current?.publishedAt ?? new Date() : current?.publishedAt ?? null,
    },
  });
  await logAudit({ adminUserId, action: "content.update", entityType: "ContentPage", entityId: page.id });
  return page;
}

export async function deleteContentPage(id: string, adminUserId: string) {
  await prisma.contentPage.delete({ where: { id } });
  await logAudit({ adminUserId, action: "content.delete", entityType: "ContentPage", entityId: id });
}
