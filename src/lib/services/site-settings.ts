import "server-only";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";

export const HERO_TITLE_KEY = "hero.title";
export const HERO_SUBTITLE_KEY = "hero.subtitle";
export const HERO_CTA_LABEL_KEY = "hero.ctaLabel";
export const CURATION_TEXT_KEY = "home.curationText";

export const DEFAULT_SETTINGS: Record<string, string> = {
  [HERO_TITLE_KEY]: "Material de tatuagem selecionado por quem tatua",
  [HERO_SUBTITLE_KEY]:
    "Máquinas, tintas, agulhas, cartuchos e todo o resto — comparamos as ofertas dos marketplaces de confiança pra você equipar o setup sem perder tempo.",
  [HERO_CTA_LABEL_KEY]: "Ver catálogo",
  [CURATION_TEXT_KEY]:
    "Cada produto listado aqui é escolhido por quem tatua de verdade: conferimos marca, reputação, avaliações e disponibilidade antes de indicar. Não vendemos diretamente — te levamos para a melhor oferta nos marketplaces parceiros.",
};

export async function getSetting(key: string): Promise<string> {
  const row = await prisma.siteSetting.findUnique({ where: { key } });
  return row?.value ?? DEFAULT_SETTINGS[key] ?? "";
}

export async function getSettings(keys: string[]): Promise<Record<string, string>> {
  const rows = await prisma.siteSetting.findMany({ where: { key: { in: keys } } });
  const map = new Map(rows.map((r) => [r.key, r.value]));
  const result: Record<string, string> = {};
  for (const key of keys) {
    result[key] = map.get(key) ?? DEFAULT_SETTINGS[key] ?? "";
  }
  return result;
}

export async function setSettings(values: Record<string, string>, adminUserId: string) {
  await prisma.$transaction(
    Object.entries(values).map(([key, value]) =>
      prisma.siteSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value, type: "string", public: true },
      }),
    ),
  );
  await logAudit({
    adminUserId,
    action: "settings.update",
    entityType: "SiteSetting",
    entityId: Object.keys(values).join(","),
  });
}
