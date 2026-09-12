import "server-only";
import { prisma } from "@/lib/prisma";
import { uniqueSlug } from "@/lib/slug";
import { categoryInputSchema, type CategoryInput } from "@/lib/validation/category";

export async function listCategoriesAdmin() {
  return prisma.category.findMany({
    orderBy: [{ position: "asc" }, { name: "asc" }],
    include: { _count: { select: { products: true } } },
  });
}

export async function listActiveCategories() {
  return prisma.category.findMany({
    where: { active: true },
    orderBy: [{ position: "asc" }, { name: "asc" }],
  });
}

export async function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({ where: { slug } });
}

export async function getCategoryById(id: string) {
  return prisma.category.findUnique({ where: { id } });
}

export async function createCategory(rawInput: unknown) {
  const input: CategoryInput = categoryInputSchema.parse(rawInput);
  const slug = await uniqueSlugForCategory(input.slug ?? input.name);
  return prisma.category.create({
    data: {
      name: input.name,
      slug,
      description: input.description,
      imageUrl: input.imageUrl,
      active: input.active,
      position: input.position,
    },
  });
}

export async function updateCategory(id: string, rawInput: unknown) {
  const input: CategoryInput = categoryInputSchema.parse(rawInput);
  const slug = await uniqueSlugForCategory(input.slug ?? input.name, id);
  return prisma.category.update({
    where: { id },
    data: {
      name: input.name,
      slug,
      description: input.description,
      imageUrl: input.imageUrl,
      active: input.active,
      position: input.position,
    },
  });
}

export async function deleteCategory(id: string) {
  const count = await prisma.product.count({ where: { categoryId: id } });
  if (count > 0) {
    throw new Error("Não é possível excluir uma categoria que possui produtos vinculados.");
  }
  return prisma.category.delete({ where: { id } });
}

async function uniqueSlugForCategory(base: string, excludeId?: string): Promise<string> {
  const existing = await prisma.category.findMany({ select: { id: true, slug: true } });
  const taken = new Set(existing.filter((c) => c.id !== excludeId).map((c) => c.slug));
  return uniqueSlug(base, (candidate) => taken.has(candidate));
}
