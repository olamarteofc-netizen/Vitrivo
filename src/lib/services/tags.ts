import "server-only";
import { prisma } from "@/lib/prisma";
import { uniqueSlug } from "@/lib/slug";
import { tagInputSchema, type TagInput } from "@/lib/validation/category";

export async function listTags() {
  return prisma.tag.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });
}

export async function createTag(rawInput: unknown) {
  const input: TagInput = tagInputSchema.parse(rawInput);
  const existing = await prisma.tag.findMany({ select: { slug: true } });
  const taken = new Set(existing.map((t) => t.slug));
  const slug = uniqueSlug(input.slug ?? input.name, (candidate) => taken.has(candidate));
  return prisma.tag.create({ data: { name: input.name, slug } });
}

export async function deleteTag(id: string) {
  return prisma.tag.delete({ where: { id } });
}
