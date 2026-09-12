"use client";

import { siteConfig } from "@/config/site";
import { trackGA4 } from "@/lib/analytics/adapters/ga4";
import { trackMetaPixel } from "@/lib/analytics/adapters/meta-pixel";
import { trackTikTokPixel } from "@/lib/analytics/adapters/tiktok-pixel";
import type { AnalyticsEvent } from "@/lib/analytics/types";

const recentEvents = new Set<string>();

/** Evita disparar o mesmo evento (mesmo tipo+chave) duas vezes em sequência imediata. */
function shouldDedupe(event: AnalyticsEvent): boolean {
  const key =
    event.name === "page_view"
      ? `page_view:${event.path}`
      : event.name === "view_product"
        ? `view_product:${event.productSlug}`
        : event.name === "view_category"
          ? `view_category:${event.categorySlug}`
          : null;
  if (!key) return false;
  if (recentEvents.has(key)) return true;
  recentEvents.add(key);
  setTimeout(() => recentEvents.delete(key), 2000);
  return false;
}

export function track(event: AnalyticsEvent): void {
  if (typeof window === "undefined") return;
  if (shouldDedupe(event)) return;

  trackGA4(event, siteConfig.analytics.gaId);
  trackMetaPixel(event, siteConfig.analytics.metaPixelId);
  trackTikTokPixel(event, siteConfig.analytics.tiktokPixelId);
}
