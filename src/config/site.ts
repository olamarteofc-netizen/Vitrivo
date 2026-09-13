/**
 * Configuração central e substituível da marca. Todo texto, cor de destaque,
 * domínio, e-mail, redes sociais e IDs de analytics devem ser lidos a partir
 * daqui — nunca hardcoded em componentes. Trocar de marca/domínio/nicho é,
 * por design, uma questão de trocar variáveis de ambiente (.env), não de
 * editar código-fonte.
 *
 * Valores públicos (NEXT_PUBLIC_*) ficam visíveis no navegador — nunca
 * coloque segredos aqui. Segredos server-side vivem em src/config/env.ts.
 */

export type SiteConfig = {
  name: string;
  slogan: string;
  url: string;
  /** `undefined` quando ainda não configurado — nunca exibir um e-mail inventado. */
  contactEmail: string | undefined;
  social: {
    instagram?: string;
    tiktok?: string;
    youtube?: string;
  };
  analytics: {
    gaId?: string;
    metaPixelId?: string;
    tiktokPixelId?: string;
  };
  features: {
    guides: boolean;
    newsletter: boolean;
  };
};

function readBool(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined || value.trim() === "") return fallback;
  return value === "true" || value === "1";
}

function readOptional(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export const siteConfig: SiteConfig = {
  name: readOptional(process.env.NEXT_PUBLIC_SITE_NAME) ?? "VITRIVO",
  slogan:
    readOptional(process.env.NEXT_PUBLIC_SITE_SLOGAN) ??
    "Curadoria confiável de produtos",
  url: readOptional(process.env.NEXT_PUBLIC_SITE_URL) ?? "http://localhost:3000",
  contactEmail: readOptional(process.env.NEXT_PUBLIC_CONTACT_EMAIL),
  social: {
    instagram: readOptional(process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM),
    tiktok: readOptional(process.env.NEXT_PUBLIC_SOCIAL_TIKTOK),
    youtube: readOptional(process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE),
  },
  analytics: {
    gaId: readOptional(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID),
    metaPixelId: readOptional(process.env.NEXT_PUBLIC_META_PIXEL_ID),
    tiktokPixelId: readOptional(process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID),
  },
  features: {
    guides: readBool(process.env.NEXT_PUBLIC_FEATURE_GUIDES, true),
    newsletter: readBool(process.env.NEXT_PUBLIC_FEATURE_NEWSLETTER, false),
  },
};

/** Texto padrão de divulgação de afiliado, usado quando o marketplace não define um próprio. */
export const DEFAULT_AFFILIATE_DISCLOSURE =
  "Este site pode receber uma comissão por compras feitas através dos links de \"Ver produto\". Preço e disponibilidade podem mudar no site do parceiro.";

export const LEGAL_CONTACT_NOTE =
  "Dúvidas sobre pedidos, entrega, pagamento, cancelamento ou devolução devem ser tratadas diretamente com o marketplace onde a compra foi realizada.";
