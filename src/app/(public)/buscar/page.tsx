import type { Metadata } from "next";
import { listPublicProducts } from "@/lib/services/products";
import { listActiveCategories } from "@/lib/services/categories";
import { listActiveMarketplaces } from "@/lib/services/marketplaces";
import { ProductCard } from "@/components/site/product-card";
import { ProductFilters } from "@/components/site/product-filters";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { SearchBar } from "@/components/site/search-bar";
import { Breadcrumb } from "@/components/site/breadcrumb";
import { SearchViewTracker } from "@/components/analytics/view-trackers";
import type { SortOption } from "@/types";

export const metadata: Metadata = {
  title: "Buscar produtos",
  robots: { index: false, follow: true },
};

const VALID_SORTS: SortOption[] = ["destaque", "recentes", "populares"];

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const categoria = typeof sp.categoria === "string" ? sp.categoria : undefined;
  const marketplace = typeof sp.marketplace === "string" ? sp.marketplace : undefined;
  const sortParam = typeof sp.ordenar === "string" ? sp.ordenar : undefined;
  const sort: SortOption = VALID_SORTS.includes(sortParam as SortOption) ? (sortParam as SortOption) : "destaque";
  const page = typeof sp.page === "string" ? Math.max(1, Number(sp.page) || 1) : 1;

  const hasQuery = q.length > 0;

  const [result, categories, marketplaces] = await Promise.all([
    hasQuery
      ? listPublicProducts({ search: q, categorySlug: categoria, marketplaceSlug: marketplace, sort, page })
      : Promise.resolve({ items: [], total: 0, page: 1, pageSize: 12, pageCount: 1 }),
    listActiveCategories(),
    listActiveMarketplaces(),
  ]);

  return (
    <div className="container-page py-10">
      {hasQuery && <SearchViewTracker query={q} />}
      <Breadcrumb items={[{ label: "Início", href: "/" }, { label: "Buscar" }]} />
      <h1 className="font-display text-3xl font-bold text-ink-900">Buscar produtos</h1>
      <div className="mt-6 max-w-xl">
        <SearchBar defaultValue={q} />
      </div>

      {hasQuery ? (
        <>
          <p className="mt-6 text-sm text-ink-500">
            {result.total} resultado(s) para &ldquo;{q}&rdquo;
          </p>
          <div className="mt-4">
            <ProductFilters
              options={{ categories, marketplaces }}
              current={{ categoria, marketplace, ordenar: sort, q }}
              action="/buscar"
            />
          </div>
          <div className="mt-8">
            {result.items.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {result.items.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="Nenhum resultado encontrado"
                description="Tente palavras-chave diferentes ou explore o catálogo completo."
              />
            )}
          </div>
          <Pagination
            page={page}
            pageCount={result.pageCount}
            basePath="/buscar"
            searchParams={{ q, categoria, marketplace, ordenar: sort }}
          />
        </>
      ) : (
        <EmptyState
          className="mt-10"
          title="Digite algo para buscar"
          description="Busque por nome ou descrição de produtos do catálogo."
        />
      )}
    </div>
  );
}
