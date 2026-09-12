import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  getProductBySlugPublic,
  getRelatedProducts,
  parseBenefits,
  parseSpecifications,
} from "@/lib/services/products";
import { getAdminSession } from "@/lib/session";
import { pickPrimaryOffer, sortAlternateOffers } from "@/lib/domain/publish-rules";
import { Breadcrumb } from "@/components/site/breadcrumb";
import { ProductGallery } from "@/components/site/product-gallery";
import { OfferList, type OfferView } from "@/components/site/offer-list";
import { AffiliateDisclosure } from "@/components/site/affiliate-disclosure";
import { ShareButton } from "@/components/site/share-button";
import { ProductCard } from "@/components/site/product-card";
import { ProductViewTracker } from "@/components/analytics/view-trackers";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";
import { buildProductJsonLd } from "@/lib/structured-data";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlugPublic(slug);
  if (!product) return {};
  const images = product.media.filter((m) => m.type === "IMAGE").map((m) => m.url);
  return {
    title: product.seoTitle || product.title,
    description: product.seoDescription || product.shortDescription,
    alternates: { canonical: `/produto/${product.slug}` },
    openGraph: {
      title: product.seoTitle || product.title,
      description: product.seoDescription || product.shortDescription,
      images,
      type: "website",
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlugPublic(slug);
  if (!product) notFound();

  const isPublished = product.status === "PUBLISHED";
  if (!isPublished) {
    const session = await getAdminSession();
    if (!session?.user) notFound();
  }

  const benefits = parseBenefits(product.benefits);
  const specifications = parseSpecifications(product.specifications);
  const primaryOffer = pickPrimaryOffer(product.offers);
  const alternateOffers = sortAlternateOffers(product.offers, primaryOffer?.id);
  const related = await getRelatedProducts(product, 4);

  const toOfferView = (offer: (typeof product.offers)[number]): OfferView => ({
    id: offer.id,
    marketplaceName: offer.marketplace.name,
    disclosureText: offer.marketplace.disclosureText,
    label: offer.label,
    notes: offer.notes,
    referencePrice: offer.referencePrice,
    currency: offer.currency,
    lastCheckedAt: offer.lastCheckedAt,
    isPrimary: offer.id === primaryOffer?.id,
  });

  const offerViews: OfferView[] = [
    ...(primaryOffer ? [toOfferView(primaryOffer)] : []),
    ...alternateOffers.map(toOfferView),
  ];

  const jsonLd = buildProductJsonLd(product);

  return (
    <div className="container-page py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProductViewTracker productSlug={product.slug} title={product.title} />

      {!isPublished && (
        <div className="mb-6 rounded-xl border border-accent-300 bg-accent-50 px-4 py-3 text-sm font-medium text-accent-900">
          Pré-visualização — este produto ainda não está publicado publicamente.
        </div>
      )}

      <Breadcrumb
        items={[
          { label: "Início", href: "/" },
          { label: "Produtos", href: "/produtos" },
          ...(product.category
            ? [{ label: product.category.name, href: `/categoria/${product.category.slug}` }]
            : []),
          { label: product.title },
        ]}
      />

      <div className="grid gap-10 lg:grid-cols-2">
        <ProductGallery
          items={product.media.map((m) => ({ url: m.url, altText: m.altText, type: m.type }))}
          title={product.title}
        />

        <div>
          {product.category && (
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">{product.category.name}</p>
          )}
          <h1 className="mt-1 font-display text-2xl font-bold text-ink-900 sm:text-3xl">{product.title}</h1>
          <p className="mt-3 text-base text-ink-600">{product.shortDescription}</p>

          {product.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {product.tags.map(({ tag }) => (
                <Badge key={tag.id} tone="neutral">
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}

          <div className="mt-6 flex items-center gap-3">
            <ShareButton productSlug={product.slug} title={product.title} />
          </div>

          <h2 className="mt-8 font-display text-lg font-semibold text-ink-900">Onde comprar</h2>
          <div className="mt-3">
            <OfferList productSlug={product.slug} offers={offerViews} />
          </div>
          <p className="mt-3 text-xs text-ink-400">
            Preço e disponibilidade podem mudar no site do parceiro. Este site pode receber uma comissão pela
            venda.
          </p>
          <AffiliateDisclosure text={primaryOffer?.marketplace.disclosureText} className="mt-3" />
        </div>
      </div>

      <div className="mt-14 grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="font-display text-xl font-semibold text-ink-900">Descrição</h2>
          <div className="prose-content mt-4">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{product.description}</ReactMarkdown>
          </div>

          {benefits.length > 0 && (
            <>
              <h2 className="mt-8 font-display text-xl font-semibold text-ink-900">Benefícios</h2>
              <ul className="prose-content mt-4 list-disc space-y-1 pl-5">
                {benefits.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </>
          )}

          {product.howItWorks && (
            <>
              <h2 className="mt-8 font-display text-xl font-semibold text-ink-900">Como funciona</h2>
              <div className="prose-content mt-4">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{product.howItWorks}</ReactMarkdown>
              </div>
            </>
          )}

          {product.warnings && (
            <div className="mt-8 rounded-xl border border-accent-200 bg-accent-50 p-4 text-sm text-accent-900">
              <p className="mb-1 font-semibold">Avisos importantes</p>
              <div className="prose-content">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{product.warnings}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>

        {specifications.length > 0 && (
          <div>
            <h2 className="font-display text-xl font-semibold text-ink-900">Especificações</h2>
            <dl className="mt-4 divide-y divide-border rounded-xl border border-border bg-surface">
              {specifications.map((spec, i) => (
                <div key={i} className="flex justify-between gap-4 px-4 py-2.5 text-sm">
                  <dt className="text-ink-500">{spec.label}</dt>
                  <dd className="text-right font-medium text-ink-800">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </div>

      {product.publishedAt && (
        <p className="mt-8 text-xs text-ink-400">Atualizado em {formatDate(product.updatedAt)}</p>
      )}

      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="font-display text-xl font-semibold text-ink-900">Você também pode gostar</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
