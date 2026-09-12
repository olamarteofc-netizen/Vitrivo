"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/session";
import { createMarketplace, updateMarketplace, setMarketplaceActive, deleteMarketplace } from "@/lib/services/marketplaces";

function readMarketplaceForm(formData: FormData) {
  return {
    name: String(formData.get("name") ?? ""),
    slug: String(formData.get("slug") ?? "").trim() || undefined,
    logoUrl: String(formData.get("logoUrl") ?? ""),
    disclosureText: String(formData.get("disclosureText") ?? ""),
    allowedHosts: String(formData.get("allowedHosts") ?? ""),
    active: formData.get("active") !== "off",
  };
}

export type MarketplaceFormState = { status: "idle" | "error"; message?: string };

export async function createMarketplaceAction(
  _prevState: MarketplaceFormState,
  formData: FormData,
): Promise<MarketplaceFormState> {
  await requireAdminSession();
  try {
    await createMarketplace(readMarketplaceForm(formData));
    revalidatePath("/admin/ofertas");
    return { status: "idle" };
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Erro ao criar marketplace." };
  }
}

export async function updateMarketplaceAction(
  id: string,
  _prevState: MarketplaceFormState,
  formData: FormData,
): Promise<MarketplaceFormState> {
  await requireAdminSession();
  try {
    await updateMarketplace(id, readMarketplaceForm(formData));
    revalidatePath("/admin/ofertas");
    return { status: "idle", message: "Alterações salvas." };
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Erro ao salvar." };
  }
}

export async function setMarketplaceActiveAction(id: string, active: boolean) {
  await requireAdminSession();
  await setMarketplaceActive(id, active);
  revalidatePath("/admin/ofertas");
}

export async function deleteMarketplaceAction(id: string) {
  await requireAdminSession();
  await deleteMarketplace(id);
  revalidatePath("/admin/ofertas");
}
