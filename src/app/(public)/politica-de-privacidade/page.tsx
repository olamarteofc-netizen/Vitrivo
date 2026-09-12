import type { Metadata } from "next";
import { getContentPageBySlug } from "@/lib/services/content-pages";
import { ContentPageBody } from "@/components/site/content-page-body";

export const metadata: Metadata = { title: "Política de Privacidade" };

export default async function PrivacyPage() {
  const page = await getContentPageBySlug("politica-de-privacidade");
  return (
    <ContentPageBody page={page && page.status === "PUBLISHED" ? page : null} label="Política de Privacidade" />
  );
}
