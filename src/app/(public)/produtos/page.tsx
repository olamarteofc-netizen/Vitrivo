import type { Metadata } from "next";
import { listPublicProducts } from "@/lib/services/products";
import { listActiveCategories } from "@/lib/services/categories";
import { listActiveMarketplaces } from "@/lib/services/marketplaces";
import { ProductCard } from "@/components/site/product-card";
import { ProductFilters } from "@/components/site/product-filters";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { Breadcrumb } from "@/components/site/breadcrumb";
import type { SortOption } from "@/types";

export const metadata: Metadata = {
  title: "Produtos",
  description: "Catálogo completo de produtos selecionados pela curadoria.",
};

const VALID_SORTS: SortOption[] = ["destaque", "recentes", "populares"];

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const categoria = typeof sp.categoria === "string" ? sp.categoria : undefined;
  const marketplace = typeof sp.marketplace === "string" ? sp.marketplace : undefined;
  const q = typeof sp.q === "string" ? sp.q : undefined;
  const sortParam = typeof sp.ordenar === "string" ? sp.ordenar : undefined;
  const sort: SortOption = VALID_SORTS.includes(sortParam as SortOption) ? (sortParam as SortOption) : "destaque";
  const page = typeof sp.page === "string" ? Math.max(1, Number(sp.page) || 1) : 1;

  const [{ items, total, pageCount }, categories, marketplaces] = await Promise.all([
    listPublicProducts({ categorySlug: categoria, marketplaceSlug: marketplace, search: q, sort, page }),
    listActiveCategories(),
    listActiveMarketplaces(),
  ]);

  return (
    <div className="container-page py-10">
      <Breadcrumb items={[{ label: "Início", href: "/" }, { label: "Produtos" }]} />
      <h1 className="font-display text-3xl font-bold text-ink-900">Catálogo de produtos</h1>
      <p className="mt-1 text-sm text-ink-500">{total} produto(s) encontrado(s)</p>

      <div className="mt-6">
        <ProductFilters
          options={{ categories, marketplaces }}
          current={{ categoria, marketplace, ordenar: sort, q }}
        />
      </div>

      <div className="mt-8">
        {items.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Nenhum produto encontrado"
            description="Tente ajustar os filtros ou volte mais tarde — novos produtos são adicionados regularmente."
          />
        )}
      </div>

      <Pagination
        page={page}
        pageCount={pageCount}
        basePath="/produtos"
        searchParams={{ categoria, marketplace, q, ordenar: sort }}
      />
    </div>
  );
}
