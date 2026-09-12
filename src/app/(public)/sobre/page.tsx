import type { Metadata } from "next";
import { getContentPageBySlug } from "@/lib/services/content-pages";
import { ContentPageBody } from "@/components/site/content-page-body";

export const metadata: Metadata = { title: "Sobre" };

export default async function SobrePage() {
  const page = await getContentPageBySlug("sobre");
  return <ContentPageBody page={page && page.status === "PUBLISHED" ? page : null} label="Sobre" />;
}
