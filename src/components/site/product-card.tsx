import Link from "next/link";
import { ImageOff } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { pickPrimaryOffer } from "@/lib/domain/publish-rules";
import { Badge } from "@/components/ui/badge";

export type ProductCardData = {
  slug: string;
  title: string;
  shortDescription: string;
  featured: boolean;
  category: { name: string; slug: string } | null;
  media: { url: string; altText: string | null; type: string }[];
  offers: {
    id: string;
    isPrimary: boolean;
    active: boolean;
    position: number;
    referencePrice: number | null;
    currency: string;
    marketplace: { name: string };
  }[];
};

export function ProductCard({ product }: { product: ProductCardData }) {
  const cover = product.media.find((m) => m.type === "IMAGE");
  const primaryOffer = pickPrimaryOffer(product.offers);
  const marketplaceNames = [...new Set(product.offers.map((o) => o.marketplace.name))];

  return (
    <Link
      href={`/produto/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-card transition-shadow hover:shadow-elevated"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-ink-50">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover.url}
            alt={cover.altText ?? product.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-ink-300">
            <ImageOff className="h-10 w-10" />
          </div>
        )}
        {product.featured && (
          <Badge tone="accent" className="absolute left-3 top-3">
            Destaque
          </Badge>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        {product.category && <p className="text-xs font-medium uppercase tracking-wide text-brand-700">{product.category.name}</p>}
        <h3 className="line-clamp-2 font-display text-base font-semibold text-ink-900">{product.title}</h3>
        <p className="line-clamp-2 text-sm text-ink-500">{product.shortDescription}</p>
        <div className="mt-auto flex items-center justify-between pt-3">
          <div>
            {primaryOffer?.referencePrice != null ? (
              <p className="font-semibold text-ink-900">
                {formatPrice(primaryOffer.referencePrice, primaryOffer.currency)}
              </p>
            ) : (
              <p className="text-sm text-ink-400">Ver preço no parceiro</p>
            )}
            {marketplaceNames.length > 0 && (
              <p className="text-xs text-ink-400">
                {marketplaceNames.length > 1 ? `${marketplaceNames.length} marketplaces` : marketplaceNames[0]}
              </p>
            )}
          </div>
          <span className="rounded-lg bg-ink-900 px-3 py-1.5 text-xs font-semibold text-white group-hover:bg-brand-700">
            Ver produto
          </span>
        </div>
      </div>
    </Link>
  );
}
