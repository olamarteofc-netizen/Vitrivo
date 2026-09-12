import type { Metadata } from "next";
import { getContentPageBySlug } from "@/lib/services/content-pages";
import { ContentPageBody } from "@/components/site/content-page-body";

export const metadata: Metadata = { title: "Termos de Uso" };

export default async function TermsPage() {
  const page = await getContentPageBySlug("termos-de-uso");
  return <ContentPageBody page={page && page.status === "PUBLISHED" ? page : null} label="Termos de Uso" />;
}
