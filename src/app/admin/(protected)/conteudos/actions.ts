"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/session";
import { createContentPage, updateContentPage, deleteContentPage, getContentPageById } from "@/lib/services/content-pages";

export type ContentFormState = { status: "idle" | "error"; message?: string };

function readForm(formData: FormData) {
  return {
    title: String(formData.get("title") ?? ""),
    slug: String(formData.get("slug") ?? "").trim() || undefined,
    body: String(formData.get("body") ?? ""),
    type: String(formData.get("type") ?? "PAGE"),
    status: String(formData.get("status") ?? "DRAFT"),
    seoTitle: String(formData.get("seoTitle") ?? ""),
    seoDescription: String(formData.get("seoDescription") ?? ""),
  };
}

function revalidateContentPaths(slug?: string, type?: string) {
  revalidatePath("/admin/conteudos");
  revalidatePath("/");
  if (!slug) return;
  if (type === "GUIDE") {
    revalidatePath("/guias");
    revalidatePath(`/guias/${slug}`);
  } else {
    revalidatePath(`/${slug}`);
  }
}

export async function createContentPageAction(
  _prevState: ContentFormState,
  formData: FormData,
): Promise<ContentFormState> {
  const session = await requireAdminSession();
  let created: { id: string; slug: string; type: string };
  try {
    created = await createContentPage(readForm(formData), session.user.id);
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Erro ao criar conteúdo." };
  }
  revalidateContentPaths(created.slug, created.type);
  redirect(`/admin/conteudos/${created.id}`);
}

export async function updateContentPageAction(
  id: string,
  _prevState: ContentFormState,
  formData: FormData,
): Promise<ContentFormState> {
  const session = await requireAdminSession();
  try {
    const updated = await updateContentPage(id, readForm(formData), session.user.id);
    revalidateContentPaths(updated.slug, updated.type);
    return { status: "idle", message: "Alterações salvas." };
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Erro ao salvar." };
  }
}

export async function deleteContentPageAction(id: string) {
  const session = await requireAdminSession();
  const page = await getContentPageById(id);
  await deleteContentPage(id, session.user.id);
  revalidateContentPaths(page?.slug, page?.type);
  redirect("/admin/conteudos");
}
