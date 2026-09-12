"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/session";
import {
  setSettings,
  HERO_TITLE_KEY,
  HERO_SUBTITLE_KEY,
  HERO_CTA_LABEL_KEY,
  CURATION_TEXT_KEY,
} from "@/lib/services/site-settings";
import { markContactMessageRead } from "@/lib/services/contact";

export type SettingsFormState = { status: "idle" | "error"; message?: string };

export async function updateSettingsAction(
  _prevState: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  const session = await requireAdminSession();
  await setSettings(
    {
      [HERO_TITLE_KEY]: String(formData.get("heroTitle") ?? ""),
      [HERO_SUBTITLE_KEY]: String(formData.get("heroSubtitle") ?? ""),
      [HERO_CTA_LABEL_KEY]: String(formData.get("heroCtaLabel") ?? ""),
      [CURATION_TEXT_KEY]: String(formData.get("curationText") ?? ""),
    },
    session.user.id,
  );
  revalidatePath("/");
  revalidatePath("/admin/configuracoes");
  return { status: "idle", message: "Configurações salvas." };
}

export async function markMessageReadAction(id: string, read: boolean) {
  await requireAdminSession();
  await markContactMessageRead(id, read);
  revalidatePath("/admin/configuracoes");
}
