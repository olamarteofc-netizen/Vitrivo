"use client";

import * as React from "react";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/cn";

export type GalleryItem = { url: string; altText: string | null; type: string };

export function ProductGallery({ items, title }: { items: GalleryItem[]; title: string }) {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const active = items[activeIndex];

  if (items.length === 0) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-2xl bg-ink-50 text-ink-300">
        <ImageOff className="h-12 w-12" />
      </div>
    );
  }

  return (
    <div>
      <div className="aspect-square w-full overflow-hidden rounded-2xl bg-ink-50">
        {active.type === "VIDEO" ? (
          <video
            key={active.url}
            src={active.url}
            controls
            className="h-full w-full object-cover"
            aria-label={active.altText ?? title}
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={active.url}
            alt={active.altText ?? title}
            className="h-full w-full object-cover"
          />
        )}
      </div>
      {items.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {items.map((item, index) => (
            <button
              key={item.url + index}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Ver mídia ${index + 1} de ${items.length}`}
              aria-current={index === activeIndex}
              className={cn(
                "relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2",
                index === activeIndex ? "border-brand-600" : "border-transparent",
              )}
            >
              {item.type === "VIDEO" ? (
                <div className="flex h-full w-full items-center justify-center bg-ink-800 text-[10px] text-white">
                  Vídeo
                </div>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.url} alt="" className="h-full w-full object-cover" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
