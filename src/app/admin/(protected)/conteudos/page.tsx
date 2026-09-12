import Link from "next/link";
import { Plus } from "lucide-react";
import { listContentPagesAdmin } from "@/lib/services/content-pages";
import { LinkButton } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, Thead, Th, Tr, Td } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/format";

export const metadata = { title: "Conteúdos" };

export default async function AdminContentPagesPage() {
  const pages = await listContentPagesAdmin();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-900">Conteúdos</h1>
          <p className="mt-1 text-sm text-ink-500">Páginas institucionais, legais e guias editoriais.</p>
        </div>
        <LinkButton href="/admin/conteudos/novo">
          <Plus className="h-4 w-4" />
          Novo conteúdo
        </LinkButton>
      </div>

      <div className="mt-6">
        {pages.length > 0 ? (
          <Table>
            <Thead>
              <tr>
                <Th>Título</Th>
                <Th>Tipo</Th>
                <Th>Status</Th>
                <Th>Atualizado em</Th>
              </tr>
            </Thead>
            <tbody>
              {pages.map((page) => (
                <Tr key={page.id}>
                  <Td>
                    <Link href={`/admin/conteudos/${page.id}`} className="font-medium text-ink-900 hover:text-brand-700">
                      {page.title}
                    </Link>
                    <p className="text-xs text-ink-400">/{page.type === "GUIDE" ? "guias/" : ""}{page.slug}</p>
                  </Td>
                  <Td>{page.type === "GUIDE" ? "Guia" : "Página"}</Td>
                  <Td>
                    <Badge tone={page.status === "PUBLISHED" ? "brand" : "neutral"}>
                      {page.status === "PUBLISHED" ? "Publicado" : "Rascunho"}
                    </Badge>
                  </Td>
                  <Td>{formatDate(page.updatedAt)}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <EmptyState title="Nenhum conteúdo cadastrado" description="Crie as páginas institucionais e legais." />
        )}
      </div>
    </div>
  );
}
