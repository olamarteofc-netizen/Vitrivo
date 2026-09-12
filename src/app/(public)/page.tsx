import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { listFeaturedProducts, listRecentProducts } from "@/lib/services/products";
import { listActiveCategories } from "@/lib/services/categories";
import { listPublishedGuides } from "@/lib/services/content-pages";
import {
  getSettings,
  HERO_TITLE_KEY,
  HERO_SUBTITLE_KEY,
  HERO_CTA_LABEL_KEY,
  CURATION_TEXT_KEY,
} from "@/lib/services/site-settings";
import { siteConfig } from "@/config/site";
import { ProductCard } from "@/components/site/product-card";
import { EmptyState } from "@/components/ui/empty-state";
import { LinkButton } from "@/components/ui/button";
import { AffiliateDisclosure } from "@/components/site/affiliate-disclosure";
import { buildOrganizationJsonLd } from "@/lib/structured-data";

export default async function HomePage() {
  const [settings, featured, recent, categories, guides] = await Promise.all([
    getSettings([HERO_TITLE_KEY, HERO_SUBTITLE_KEY, HERO_CTA_LABEL_KEY, CURATION_TEXT_KEY]),
    listFeaturedProducts(8),
    listRecentProducts(8),
    listActiveCategories(),
    siteConfig.features.guides ? listPublishedGuides() : Promise.resolve([]),
  ]);

  const jsonLd = buildOrganizationJsonLd();

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="border-b border-border bg-gradient-to-b from-brand-50 to-background">
        <div className="container-page grid gap-8 py-16 sm:py-20 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand-700">
              {siteConfig.name}
            </p>
            <h1 className="text-balance font-display text-3xl font-bold leading-tight text-ink-900 sm:text-4xl lg:text-5xl">
              {settings[HERO_TITLE_KEY]}
            </h1>
            <p className="mt-4 max-w-xl text-balance text-base text-ink-600 sm:text-lg">
              {settings[HERO_SUBTITLE_KEY]}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <LinkButton href="/produtos" size="lg">
                {settings[HERO_CTA_LABEL_KEY]}
                <ArrowRight className="h-4 w-4" />
              </LinkButton>
              <LinkButton href="/sobre" size="lg" variant="outline">
                Como funciona a curadoria
              </LinkButton>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="aspect-[4/3] rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-100 to-accent-100" />
          </div>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="container-page py-14">
          <h2 className="font-display text-2xl font-semibold text-ink-900">Categorias</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/categoria/${category.slug}`}
                className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-surface p-5 text-center transition-shadow hover:shadow-elevated"
              >
                <span className="font-medium text-ink-800">{category.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="container-page py-14">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-semibold text-ink-900">Produtos em destaque</h2>
          <Link href="/produtos" className="text-sm font-medium text-brand-700 hover:text-brand-800">
            Ver todos
          </Link>
        </div>
        <div className="mt-6">
          {featured.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="Nenhum produto em destaque ainda"
              description="Assim que produtos forem publicados e marcados como destaque, eles aparecem aqui."
            />
          )}
        </div>
      </section>

      {recent.length > 0 && (
        <section className="container-page py-14">
          <h2 className="font-display text-2xl font-semibold text-ink-900">Novidades</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {recent.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      <section className="border-y border-border bg-ink-50">
        <div className="container-page grid gap-8 py-14 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="font-display text-2xl font-semibold text-ink-900">O que é a curadoria {siteConfig.name}</h2>
            <p className="prose-content mt-4">{settings[CURATION_TEXT_KEY]}</p>
          </div>
          <div className="flex items-start">
            <AffiliateDisclosure className="w-full" />
          </div>
        </div>
      </section>

      {siteConfig.features.guides && guides.length > 0 && (
        <section className="container-page py-14">
          <h2 className="font-display text-2xl font-semibold text-ink-900">Guias e conteúdo</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {guides.slice(0, 3).map((guide) => (
              <Link
                key={guide.id}
                href={`/guias/${guide.slug}`}
                className="rounded-2xl border border-border bg-surface p-5 transition-shadow hover:shadow-elevated"
              >
                <h3 className="font-display text-lg font-semibold text-ink-900">{guide.title}</h3>
                {guide.seoDescription && <p className="mt-2 text-sm text-ink-500">{guide.seoDescription}</p>}
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
