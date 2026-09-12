import type { AnalyticsEvent } from "@/lib/analytics/types";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export function trackMetaPixel(event: AnalyticsEvent, pixelId: string | undefined) {
  if (!pixelId || typeof window === "undefined" || typeof window.fbq !== "function") return;

  switch (event.name) {
    case "page_view":
      window.fbq("track", "PageView");
      break;
    case "search":
      window.fbq("track", "Search", { search_string: event.query });
      break;
    case "view_category":
      window.fbq("track", "ViewContent", { content_category: event.categorySlug });
      break;
    case "view_product":
      window.fbq("track", "ViewContent", { content_ids: [event.productSlug], content_name: event.title });
      break;
    case "cta_click":
      window.fbq("trackCustom", "AffiliateClick", {
        content_ids: [event.productSlug],
        marketplace: event.marketplace,
      });
      break;
    case "share":
      window.fbq("trackCustom", "Share", { method: event.method, content_ids: [event.productSlug] });
      break;
  }
}
