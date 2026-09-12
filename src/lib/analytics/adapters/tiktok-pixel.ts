import type { AnalyticsEvent } from "@/lib/analytics/types";

declare global {
  interface Window {
    ttq?: { track: (...args: unknown[]) => void };
  }
}

export function trackTikTokPixel(event: AnalyticsEvent, pixelId: string | undefined) {
  if (!pixelId || typeof window === "undefined" || typeof window.ttq?.track !== "function") return;

  switch (event.name) {
    case "page_view":
      window.ttq.track("PageView");
      break;
    case "search":
      window.ttq.track("Search", { query: event.query });
      break;
    case "view_category":
      window.ttq.track("ViewContent", { content_id: event.categorySlug });
      break;
    case "view_product":
      window.ttq.track("ViewContent", { content_id: event.productSlug, content_name: event.title });
      break;
    case "cta_click":
      window.ttq.track("ClickButton", { content_id: event.offerId, description: event.marketplace });
      break;
    case "share":
      window.ttq.track("Share", { content_id: event.productSlug });
      break;
  }
}
