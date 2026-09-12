import type { Metadata } from "next";
import { getContentPageBySlug } from "@/lib/services/content-pages";
import { ContentPageBody } from "@/components/site/content-page-body";

export const metadata: Metadata = { title: "Política de Cookies" };

export default async function CookiesPage() {
  const page = await getContentPageBySlug("politica-de-cookies");
  return <ContentPageBody page={page && page.status === "PUBLISHED" ? page : null} label="Política de Cookies" />;
}
