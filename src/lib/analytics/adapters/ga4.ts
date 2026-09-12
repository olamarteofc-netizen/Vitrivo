import type { AnalyticsEvent } from "@/lib/analytics/types";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackGA4(event: AnalyticsEvent, measurementId: string | undefined) {
  if (!measurementId || typeof window === "undefined" || typeof window.gtag !== "function") return;

  switch (event.name) {
    case "page_view":
      window.gtag("event", "page_view", { page_path: event.path });
      break;
    case "search":
      window.gtag("event", "search", { search_term: event.query });
      break;
    case "view_category":
      window.gtag("event", "view_item_list", { item_list_name: event.categorySlug });
      break;
    case "view_product":
      window.gtag("event", "view_item", { item_id: event.productSlug, item_name: event.title });
      break;
    case "cta_click":
      window.gtag("event", "select_content", {
        content_type: "affiliate_offer",
        item_id: event.offerId,
        item_name: event.productSlug,
        marketplace: event.marketplace,
      });
      break;
    case "share":
      window.gtag("event", "share", { method: event.method, item_id: event.productSlug });
      break;
  }
}
