export type AnalyticsEvent =
  | { name: "page_view"; path: string }
  | { name: "search"; query: string }
  | { name: "view_category"; categorySlug: string }
  | { name: "view_product"; productSlug: string; title: string }
  | { name: "cta_click"; productSlug: string; offerId: string; marketplace: string }
  | { name: "share"; method: string; productSlug: string };

export type AnalyticsAdapter = (event: AnalyticsEvent) => void;
