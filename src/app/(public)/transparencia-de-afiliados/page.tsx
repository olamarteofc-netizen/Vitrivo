import type { Metadata } from "next";
import { getContentPageBySlug } from "@/lib/services/content-pages";
import { ContentPageBody } from "@/components/site/content-page-body";

export const metadata: Metadata = { title: "Transparência de Afiliados" };

export default async function AffiliateTransparencyPage() {
  const page = await getContentPageBySlug("transparencia-de-afiliados");
  return (
    <ContentPageBody
      page={page && page.status === "PUBLISHED" ? page : null}
      label="Transparência de Afiliados"
    />
  );
}
