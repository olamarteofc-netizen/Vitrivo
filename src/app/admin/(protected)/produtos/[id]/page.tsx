import { notFound } from "next/navigation";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { getProductByIdAdmin, parseBenefits, parseSpecifications } from "@/lib/services/products";
import { listCategoriesAdmin } from "@/lib/services/categories";
import { listTags } from "@/lib/services/tags";
import { listActiveMarketplaces } from "@/lib/services/marketplaces";
import { buildPublishChecklist } from "@/lib/domain/publish-rules";
import { Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ConfirmSubmitButton } from "@/components/ui/confirm-submit-button";
import { Button } from "@/components/ui/button";
import { ProductForm } from "../product-form";
import { MediaManager } from "../media-manager";
import { OffersManager } from "../offers-manager";
import {
  updateProductAction,
  duplicateProductAction,
  publishProductAction,
  archiveProductAction,
  backToDraftAction,
} from "../actions";
import type { ProductStatus } from "@/types";

const STATUS_LABEL: Record<ProductStatus, string> = {
  DRAFT: "Rascunho",
  PUBLISHED: "Publicado",
  ARCHIVED: "Arquivado",
};
const STATUS_TONE: Record<ProductStatus, "neutral" | "brand" | "danger"> = {
  DRAFT: "neutral",
  PUBLISHED: "brand",
  ARCHIVED: "danger",
};

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const product = await getProductByIdAdmin(id);
  return { title: product ? product.title : "Produto" };
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const [product, categories, tags, marketplaces] = await Promise.all([
    getProductByIdAdmin(id),
    listCategoriesAdmin(),
    listTags(),
    listActiveMarketplaces(),
  ]);

  if (!product) notFound();

  const activeOfferCount = product.offers.filter((o) => o.active).length;
  const checklist = buildPublishChecklist({
    title: product.title,
    slug: product.slug,
    shortDescription: product.shortDescription,
    description: product.description,
    activeOfferCount,
    mediaCount: product.media.length,
  });
  const pendingItems = checklist.filter((item) => !item.ok);
  const canPublish = pendingItems.length === 0;

  const boundUpdate = updateProductAction.bind(null, product.id);

  return (
    <div className="mx-auto max-w-3xl pb-16">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-semibold text-ink-900">{product.title}</h1>
            <Badge tone={STATUS_TONE[product.status as ProductStatus]}>
              {STATUS_LABEL[product.status as ProductStatus]}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-ink-500">/produto/{product.slug}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={`/produto/${product.slug}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border px-3 text-sm font-medium text-ink-700 hover:bg-ink-100"
          >
            <ExternalLink className="h-4 w-4" />
            Pré-visualizar
          </a>
          <form action={duplicateProductAction.bind(null, product.id)}>
            <Button type="submit" variant="outline">
              Duplicar
            </Button>
          </form>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-border bg-surface p-4">
        {product.status !== "PUBLISHED" && (
          <form action={publishProductAction.bind(null, product.id)}>
            <Button type="submit" disabled={!canPublish}>
              Publicar
            </Button>
          </form>
        )}
        {product.status === "PUBLISHED" && (
          <form action={backToDraftAction.bind(null, product.id)}>
            <Button type="submit" variant="outline">
              Voltar a rascunho
            </Button>
          </form>
        )}
        {product.status !== "ARCHIVED" && (
          <form action={archiveProductAction.bind(null, product.id)}>
            <ConfirmSubmitButton
              confirmTitle="Arquivar produto"
              confirmDescription="O produto sairá de todas as listagens públicas imediatamente. Você pode reverter depois."
              confirmLabel="Arquivar"
            >
              Arquivar
            </ConfirmSubmitButton>
          </form>
        )}
      </div>

      {product.status !== "PUBLISHED" && (
        <div className="mt-4 rounded-xl border border-border bg-surface p-4">
          <p className="text-sm font-semibold text-ink-900">
            {canPublish ? "Pronto para publicar" : `Faltam ${pendingItems.length} item(ns) para publicar`}
          </p>
          <ul className="mt-2 grid gap-1 sm:grid-cols-2">
            {checklist.map((item) => (
              <li
                key={item.key}
                className={`flex items-center gap-1.5 text-sm ${item.ok ? "text-ink-600" : "text-danger-600"}`}
              >
                {item.ok ? <Check className="h-4 w-4 shrink-0" /> : <X className="h-4 w-4 shrink-0" />}
                {item.label}
              </li>
            ))}
          </ul>
        </div>
      )}

      <section className="mt-8">
        <h2 className="font-display text-lg font-semibold text-ink-900">Mídia</h2>
        <div className="mt-3">
          <MediaManager productId={product.id} media={product.media} />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-lg font-semibold text-ink-900">Ofertas</h2>
        <div className="mt-3">
          <OffersManager
            productId={product.id}
            offers={product.offers}
            marketplaces={marketplaces.map((m) => ({ id: m.id, name: m.name }))}
          />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-lg font-semibold text-ink-900">Conteúdo do produto</h2>
        <div className="mt-3">
          <ProductForm
            action={boundUpdate}
            categories={categories}
            tags={tags}
            submitLabel="Salvar alterações"
            defaults={{
              title: product.title,
              slug: product.slug,
              shortDescription: product.shortDescription,
              description: product.description,
              benefits: parseBenefits(product.benefits),
              howItWorks: product.howItWorks,
              specifications: parseSpecifications(product.specifications),
              warnings: product.warnings,
              categoryId: product.categoryId,
              tagIds: product.tags.map((t) => t.tagId),
              featured: product.featured,
              seoTitle: product.seoTitle,
              seoDescription: product.seoDescription,
            }}
          />
        </div>
      </section>

      <p className="mt-8 text-sm">
        <Link href="/admin/produtos" className="text-brand-700 hover:underline">
          ← Voltar para a lista de produtos
        </Link>
      </p>
    </div>
  );
}
