import { siteConfig } from "@/config/site";

type ProductForSchema = {
  slug: string;
  title: string;
  shortDescription: string;
  media: { url: string; type: string }[];
  category: { name: string } | null;
  offers: { referencePrice: number | null; currency: string }[];
};

/**
 * Gera apenas dados reais e verificáveis a partir do cadastro — nunca
 * disponibilidade, avaliações ou descontos inventados.
 */
export function buildProductJsonLd(product: ProductForSchema) {
  const images = product.media.filter((m) => m.type === "IMAGE").map((m) => m.url);
  const pricedOffers = product.offers.filter((o) => o.referencePrice !== null);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.shortDescription,
    ...(images.length > 0 ? { image: images } : {}),
    ...(product.category ? { category: product.category.name } : {}),
    url: `${siteConfig.url}/produto/${product.slug}`,
    ...(pricedOffers.length > 0
      ? {
          offers: pricedOffers.map((o) => ({
            "@type": "Offer",
            price: o.referencePrice,
            priceCurrency: o.currency,
            url: `${siteConfig.url}/produto/${product.slug}`,
          })),
        }
      : {}),
  };
}

export function buildOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    email: siteConfig.contactEmail,
  };
}
