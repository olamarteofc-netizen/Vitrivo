import Link from "next/link";
import { Plus, Copy, Star } from "lucide-react";
import { listProductsAdmin } from "@/lib/services/products";
import { Button, LinkButton } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, Thead, Th, Tr, Td } from "@/components/ui/table";
import { Input, Select } from "@/components/ui/field";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/ui/empty-state";
import type { ProductStatus } from "@/types";
import {
  duplicateProductAction,
  publishProductAction,
  archiveProductAction,
  backToDraftAction,
  toggleFeaturedAction,
} from "./actions";

export const metadata = { title: "Produtos" };

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

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const status = typeof sp.status === "string" ? (sp.status as ProductStatus | "ALL") : "ALL";
  const search = typeof sp.q === "string" ? sp.q : undefined;
  const page = typeof sp.page === "string" ? Math.max(1, Number(sp.page) || 1) : 1;

  const { items, total, pageCount } = await listProductsAdmin({ status, search, page });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-900">Produtos</h1>
          <p className="mt-1 text-sm text-ink-500">{total} produto(s)</p>
        </div>
        <LinkButton href="/admin/produtos/novo">
          <Plus className="h-4 w-4" />
          Novo produto
        </LinkButton>
      </div>

      <form method="GET" className="mt-6 flex flex-wrap gap-3">
        <Input name="q" defaultValue={search} placeholder="Buscar por título…" className="max-w-xs" />
        <Select name="status" defaultValue={status} className="max-w-[180px]">
          <option value="ALL">Todos os status</option>
          <option value="DRAFT">Rascunho</option>
          <option value="PUBLISHED">Publicado</option>
          <option value="ARCHIVED">Arquivado</option>
        </Select>
        <Button type="submit" variant="outline">
          Filtrar
        </Button>
      </form>

      <div className="mt-6">
        {items.length > 0 ? (
          <Table>
            <Thead>
              <tr>
                <Th>Produto</Th>
                <Th>Categoria</Th>
                <Th>Status</Th>
                <Th>Ofertas</Th>
                <Th>Destaque</Th>
                <Th>Ações</Th>
              </tr>
            </Thead>
            <tbody>
              {items.map((product) => (
                <Tr key={product.id}>
                  <Td>
                    <Link href={`/admin/produtos/${product.id}`} className="font-medium text-ink-900 hover:text-brand-700">
                      {product.title}
                    </Link>
                  </Td>
                  <Td>{product.category?.name ?? "—"}</Td>
                  <Td>
                    <Badge tone={STATUS_TONE[product.status as ProductStatus]}>
                      {STATUS_LABEL[product.status as ProductStatus]}
                    </Badge>
                  </Td>
                  <Td>{product._count.offers}</Td>
                  <Td>
                    <form action={toggleFeaturedAction.bind(null, product.id, !product.featured)}>
                      <button
                        type="submit"
                        aria-label={product.featured ? "Remover destaque" : "Marcar como destaque"}
                        className="text-ink-400 hover:text-accent-600"
                      >
                        <Star className={product.featured ? "h-5 w-5 fill-accent-500 text-accent-500" : "h-5 w-5"} />
                      </button>
                    </form>
                  </Td>
                  <Td>
                    <div className="flex flex-wrap items-center gap-2">
                      <Link href={`/admin/produtos/${product.id}`} className="text-sm font-medium text-brand-700 hover:text-brand-800">
                        Editar
                      </Link>
                      <form action={duplicateProductAction.bind(null, product.id)}>
                        <button type="submit" className="text-ink-400 hover:text-ink-700" aria-label="Duplicar produto">
                          <Copy className="h-4 w-4" />
                        </button>
                      </form>
                      {product.status !== "PUBLISHED" && (
                        <form action={publishProductAction.bind(null, product.id)}>
                          <button type="submit" className="text-xs font-medium text-brand-700 hover:underline">
                            Publicar
                          </button>
                        </form>
                      )}
                      {product.status === "PUBLISHED" && (
                        <form action={backToDraftAction.bind(null, product.id)}>
                          <button type="submit" className="text-xs font-medium text-ink-500 hover:underline">
                            Voltar a rascunho
                          </button>
                        </form>
                      )}
                      {product.status !== "ARCHIVED" && (
                        <form action={archiveProductAction.bind(null, product.id)}>
                          <button type="submit" className="text-xs font-medium text-danger-600 hover:underline">
                            Arquivar
                          </button>
                        </form>
                      )}
                    </div>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <EmptyState title="Nenhum produto encontrado" description="Crie o primeiro produto para começar." />
        )}
      </div>

      <Pagination page={page} pageCount={pageCount} basePath="/admin/produtos" searchParams={{ q: search, status }} />
    </div>
  );
}
