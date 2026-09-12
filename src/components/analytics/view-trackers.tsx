"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics/client";

export function ProductViewTracker({ productSlug, title }: { productSlug: string; title: string }) {
  useEffect(() => {
    track({ name: "view_product", productSlug, title });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productSlug]);
  return null;
}

export function CategoryViewTracker({ categorySlug }: { categorySlug: string }) {
  useEffect(() => {
    track({ name: "view_category", categorySlug });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categorySlug]);
  return null;
}

export function SearchViewTracker({ query }: { query: string }) {
  useEffect(() => {
    if (query) track({ name: "search", query });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);
  return null;
}
