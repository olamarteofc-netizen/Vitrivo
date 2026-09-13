/**
 * Marketplaces estruturais obrigatórios da VITRIVO — fonte única de verdade.
 *
 * Estes registros precisam existir em produção independentemente de
 * `prisma db seed` (que também cria produtos de demonstração, indesejados em
 * produção). Por isso são aplicados via migration idempotente
 * (`prisma/migrations/*_bootstrap_marketplaces/migration.sql`, com
 * `ON CONFLICT (slug) DO NOTHING`) toda vez que `prisma migrate deploy` roda.
 *
 * Se precisar adicionar host, marketplace ou ajustar textos: atualize aqui E
 * crie uma nova migration idempotente — não edite a migration já aplicada.
 *
 * `www.<host>` nunca precisa ser listado separadamente: `normalizeHost()`
 * remove o prefixo "www." antes de comparar (ver src/lib/redirect/allowlist.ts).
 */
export type MarketplaceBootstrapDef = {
  id: string;
  slug: string;
  name: string;
  allowedHosts: string[];
  disclosureText: string;
};

export const MARKETPLACE_BOOTSTRAP: MarketplaceBootstrapDef[] = [
  {
    id: "mkt_mercado_livre",
    slug: "mercado-livre",
    name: "Mercado Livre",
    // meli.la é o domínio curto oficial usado pelos links de afiliado do
    // Mercado Livre — é um domínio distinto de mercadolivre.com.br, então
    // precisa estar explicitamente na allowlist (não é subdomínio).
    allowedHosts: ["mercadolivre.com.br", "mercadolibre.com", "meli.la"],
    disclosureText: "Compra processada e entregue pelo Mercado Livre.",
  },
  {
    id: "mkt_shopee",
    slug: "shopee",
    name: "Shopee",
    allowedHosts: ["shopee.com.br", "s.shopee.com.br", "shp.ee"],
    disclosureText: "Compra processada e entregue pela Shopee.",
  },
  {
    id: "mkt_tiktok_shop",
    slug: "tiktok-shop",
    name: "TikTok Shop",
    allowedHosts: ["tiktok.com", "vt.tiktok.com", "vm.tiktok.com"],
    disclosureText: "Compra processada pelo TikTok Shop.",
  },
  {
    id: "mkt_amazon",
    slug: "amazon",
    name: "Amazon",
    allowedHosts: ["amazon.com.br", "amzn.to"],
    disclosureText: "Compra processada e entregue pela Amazon.",
  },
];
