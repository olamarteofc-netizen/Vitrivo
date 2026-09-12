"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/session";
import { createCategory, updateCategory, deleteCategory } from "@/lib/services/categories";
import { createTag, deleteTag } from "@/lib/services/tags";

function readCategoryForm(formData: FormData) {
  return {
    name: String(formData.get("name") ?? ""),
    slug: String(formData.get("slug") ?? "").trim() || undefined,
    description: String(formData.get("description") ?? ""),
    imageUrl: String(formData.get("imageUrl") ?? ""),
    active: formData.get("active") !== "off",
    position: Number(formData.get("position") ?? 0) || 0,
  };
}

export async function createCategoryAction(formData: FormData) {
  await requireAdminSession();
  await createCategory(readCategoryForm(formData));
  revalidatePath("/admin/categorias");
  revalidatePath("/");
}

export async function updateCategoryAction(id: string, formData: FormData) {
  await requireAdminSession();
  await updateCategory(id, readCategoryForm(formData));
  revalidatePath("/admin/categorias");
  revalidatePath("/");
}

export async function deleteCategoryAction(id: string) {
  await requireAdminSession();
  await deleteCategory(id);
  revalidatePath("/admin/categorias");
  revalidatePath("/");
}

export async function createTagAction(formData: FormData) {
  await requireAdminSession();
  await createTag({ name: String(formData.get("name") ?? "") });
  revalidatePath("/admin/categorias");
}

export async function deleteTagAction(id: string) {
  await requireAdminSession();
  await deleteTag(id);
  revalidatePath("/admin/categorias");
}
