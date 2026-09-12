"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/session";
import {
  createProduct,
  updateProduct,
  duplicateProduct,
  publishProduct,
  archiveProduct,
  backToDraft,
  setFeatured,
  addProductMedia,
  removeProductMedia,
  reorderProductMedia,
  getProductByIdAdmin,
} from "@/lib/services/products";
import { createOffer, updateOffer, deleteOffer, setPrimaryOffer, setOfferActive, markOfferChecked, reorderOffers } from "@/lib/services/offers";
import { parseBenefitsText, parseSpecificationsText } from "@/lib/parsing/product-text-fields";
import { productMediaInputSchema } from "@/lib/validation/product";
import { offerInputSchema } from "@/lib/validation/offer";

export type ProductFormState = {
  status: "idle" | "error";
  errors?: Record<string, string>;
  message?: string;
};

function readProductFormData(formData: FormData) {
  return {
    title: String(formData.get("title") ?? ""),
    slug: String(formData.get("slug") ?? "").trim() || undefined,
    shortDescription: String(formData.get("shortDescription") ?? ""),
    description: String(formData.get("description") ?? ""),
    benefits: parseBenefitsText(String(formData.get("benefitsText") ?? "")),
    howItWorks: String(formData.get("howItWorks") ?? ""),
    specifications: parseSpecificationsText(String(formData.get("specificationsText") ?? "")),
    warnings: String(formData.get("warnings") ?? ""),
    categoryId: String(formData.get("categoryId") ?? "") || null,
    tagIds: formData.getAll("tagIds").map(String),
    featured: formData.get("featured") === "on",
    seoTitle: String(formData.get("seoTitle") ?? ""),
    seoDescription: String(formData.get("seoDescription") ?? ""),
  };
}

function revalidatePublicProductPaths(slug?: string) {
  revalidatePath("/");
  revalidatePath("/produtos");
  if (slug) revalidatePath(`/produto/${slug}`);
}

export async function createProductAction(
  _prevState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const session = await requireAdminSession();
  const input = readProductFormData(formData);

  let created: { id: string; slug: string };
  try {
    created = await createProduct(input, session.user.id);
  } catch (error) {
    return toFormState(error);
  }

  revalidatePublicProductPaths(created.slug);
  revalidatePath("/admin/produtos");
  redirect(`/admin/produtos/${created.id}?criado=1`);
}

export async function updateProductAction(
  productId: string,
  _prevState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const session = await requireAdminSession();
  const input = readProductFormData(formData);

  try {
    const product = await updateProduct(productId, input, session.user.id);
    revalidatePublicProductPaths(product.slug);
    revalidatePath(`/admin/produtos/${productId}`);
    return { status: "idle", message: "Alterações salvas." };
  } catch (error) {
    return toFormState(error);
  }
}

function toFormState(error: unknown): ProductFormState {
  if (error && typeof error === "object" && "issues" in error) {
    const zodError = error as { issues: { path: (string | number)[]; message: string }[] };
    const errors: Record<string, string> = {};
    for (const issue of zodError.issues) errors[String(issue.path[0] ?? "form")] = issue.message;
    return { status: "error", errors };
  }
  return { status: "error", message: error instanceof Error ? error.message : "Erro inesperado." };
}

export async function duplicateProductAction(productId: string) {
  const session = await requireAdminSession();
  const copy = await duplicateProduct(productId, session.user.id);
  revalidatePath("/admin/produtos");
  redirect(`/admin/produtos/${copy.id}`);
}

export async function publishProductAction(productId: string) {
  const session = await requireAdminSession();
  const product = await getProductByIdAdmin(productId);
  await publishProduct(productId, session.user.id);
  revalidatePath("/admin/produtos");
  revalidatePath(`/admin/produtos/${productId}`);
  revalidatePublicProductPaths(product?.slug);
}

export async function archiveProductAction(productId: string) {
  const session = await requireAdminSession();
  const product = await getProductByIdAdmin(productId);
  await archiveProduct(productId, session.user.id);
  revalidatePath("/admin/produtos");
  revalidatePath(`/admin/produtos/${productId}`);
  revalidatePublicProductPaths(product?.slug);
}

export async function backToDraftAction(productId: string) {
  const session = await requireAdminSession();
  const product = await getProductByIdAdmin(productId);
  await backToDraft(productId, session.user.id);
  revalidatePath("/admin/produtos");
  revalidatePath(`/admin/produtos/${productId}`);
  revalidatePublicProductPaths(product?.slug);
}

export async function toggleFeaturedAction(productId: string, featured: boolean) {
  const session = await requireAdminSession();
  const product = await setFeatured(productId, featured, session.user.id);
  revalidatePath("/admin/produtos");
  revalidatePublicProductPaths(product.slug);
}

// ---------------------------------------------------------------------------
// Mídia
// ---------------------------------------------------------------------------

export async function addMediaAction(productId: string, formData: FormData) {
  const session = await requireAdminSession();
  const parsed = productMediaInputSchema.safeParse({
    type: formData.get("type"),
    url: formData.get("url"),
    altText: formData.get("altText"),
    position: 9999,
  });
  if (!parsed.success) return;
  await addProductMedia(productId, parsed.data, session.user.id);
  revalidatePath(`/admin/produtos/${productId}`);
  const product = await getProductByIdAdmin(productId);
  revalidatePublicProductPaths(product?.slug);
}

export async function removeMediaAction(mediaId: string, productId: string) {
  const session = await requireAdminSession();
  await removeProductMedia(mediaId, productId, session.user.id);
  revalidatePath(`/admin/produtos/${productId}`);
  const product = await getProductByIdAdmin(productId);
  revalidatePublicProductPaths(product?.slug);
}

export async function moveMediaAction(productId: string, mediaId: string, direction: "up" | "down") {
  await requireAdminSession();
  const product = await getProductByIdAdmin(productId);
  if (!product) return;
  const ids = product.media.map((m) => m.id);
  const index = ids.indexOf(mediaId);
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || swapWith < 0 || swapWith >= ids.length) return;
  [ids[index], ids[swapWith]] = [ids[swapWith], ids[index]];
  await reorderProductMedia(productId, ids);
  revalidatePath(`/admin/produtos/${productId}`);
  revalidatePublicProductPaths(product.slug);
}

// ---------------------------------------------------------------------------
// Ofertas
// ---------------------------------------------------------------------------

function readOfferFormData(productId: string, formData: FormData) {
  const referencePriceRaw = String(formData.get("referencePrice") ?? "").trim();
  return {
    productId,
    marketplaceId: String(formData.get("marketplaceId") ?? ""),
    destinationUrl: String(formData.get("destinationUrl") ?? ""),
    affiliateUrl: String(formData.get("affiliateUrl") ?? ""),
    referencePrice: referencePriceRaw ? Number(referencePriceRaw) : null,
    currency: String(formData.get("currency") ?? "BRL"),
    label: String(formData.get("label") ?? ""),
    notes: String(formData.get("notes") ?? ""),
    isPrimary: formData.get("isPrimary") === "on",
    active: formData.get("active") !== "off",
    position: 9999,
  };
}

export type OfferFormState = { status: "idle" | "error"; message?: string };

export async function createOfferAction(
  productId: string,
  _prevState: OfferFormState,
  formData: FormData,
): Promise<OfferFormState> {
  await requireAdminSession();
  const input = readOfferFormData(productId, formData);
  try {
    offerInputSchema.parse(input);
    await createOffer(input);
    await logProductRevalidate(productId);
    return { status: "idle" };
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Erro ao salvar oferta." };
  }
}

export async function updateOfferAction(
  offerId: string,
  productId: string,
  _prevState: OfferFormState,
  formData: FormData,
): Promise<OfferFormState> {
  await requireAdminSession();
  const input = readOfferFormData(productId, formData);
  try {
    offerInputSchema.parse(input);
    await updateOffer(offerId, input);
    await logProductRevalidate(productId);
    return { status: "idle" };
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Erro ao salvar oferta." };
  }
}

export async function deleteOfferAction(offerId: string, productId: string) {
  await requireAdminSession();
  await deleteOffer(offerId);
  await logProductRevalidate(productId);
}

export async function setPrimaryOfferAction(productId: string, offerId: string) {
  await requireAdminSession();
  await setPrimaryOffer(productId, offerId);
  await logProductRevalidate(productId);
}

export async function toggleOfferActiveAction(offerId: string, productId: string, active: boolean) {
  await requireAdminSession();
  await setOfferActive(offerId, active);
  await logProductRevalidate(productId);
}

export async function markOfferCheckedAction(offerId: string, productId: string) {
  await requireAdminSession();
  await markOfferChecked(offerId);
  revalidatePath(`/admin/produtos/${productId}`);
}

export async function moveOfferAction(productId: string, offerId: string, direction: "up" | "down") {
  await requireAdminSession();
  const product = await getProductByIdAdmin(productId);
  if (!product) return;
  const ids = product.offers.map((o) => o.id);
  const index = ids.indexOf(offerId);
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || swapWith < 0 || swapWith >= ids.length) return;
  [ids[index], ids[swapWith]] = [ids[swapWith], ids[index]];
  await reorderOffers(productId, ids);
  revalidatePath(`/admin/produtos/${productId}`);
}

async function logProductRevalidate(productId: string) {
  revalidatePath(`/admin/produtos/${productId}`);
  const product = await getProductByIdAdmin(productId);
  revalidatePublicProductPaths(product?.slug);
}
