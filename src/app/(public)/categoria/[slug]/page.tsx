import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryBySlug } from "@/lib/services/categories";
import { listPublicProducts } from "@/lib/services/products";
import { listActiveMarketplaces } from "@/lib/services/marketplaces";
import { listActiveCategories } from "@/lib/services/categories";
import { ProductCard } from "@/components/site/product-card";
import { ProductFilters } from "@/components/site/product-filters";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { Breadcrumb } from "@/components/site/breadcrumb";
import { CategoryViewTracker } from "@/components/analytics/view-trackers";
import type { SortOption } from "@/types";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};
  return {
    title: category.name,
    description: category.description ?? `Produtos selecionados na categoria ${category.name}.`,
  };
}

const VALID_SORTS: SortOption[] = ["destaque", "recentes", "populares"];

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;

  const category = await getCategoryBySlug(slug);
  if (!category || !category.active) notFound();

  const marketplace = typeof sp.marketplace === "string" ? sp.marketplace : undefined;
  const sortParam = typeof sp.ordenar === "string" ? sp.ordenar : undefined;
  const sort: SortOption = VALID_SORTS.includes(sortParam as SortOption) ? (sortParam as SortOption) : "destaque";
  const page = typeof sp.page === "string" ? Math.max(1, Number(sp.page) || 1) : 1;

  const [{ items, total, pageCount }, categories, marketplaces] = await Promise.all([
    listPublicProducts({ categorySlug: slug, marketplaceSlug: marketplace, sort, page }),
    listActiveCategories(),
    listActiveMarketplaces(),
  ]);

  return (
    <div className="container-page py-10">
      <CategoryViewTracker categorySlug={slug} />
      <Breadcrumb items={[{ label: "Início", href: "/" }, { label: "Produtos", href: "/produtos" }, { label: category.name }]} />
      <h1 className="font-display text-3xl font-bold text-ink-900">{category.name}</h1>
      {category.description && <p className="mt-2 max-w-2xl text-sm text-ink-500">{category.description}</p>}
      <p className="mt-1 text-sm text-ink-500">{total} produto(s) encontrado(s)</p>

      <div className="mt-6">
        <ProductFilters
          options={{ categories, marketplaces }}
          current={{ marketplace, ordenar: sort }}
          action={`/categoria/${slug}`}
          showCategory={false}
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
          <EmptyState title="Nenhum produto nesta categoria ainda" description="Volte em breve para novidades." />
        )}
      </div>

      <Pagination page={page} pageCount={pageCount} basePath={`/categoria/${slug}`} searchParams={{ marketplace, ordenar: sort }} />
    </div>
  );
}
