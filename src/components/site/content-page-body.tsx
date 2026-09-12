import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { EmptyState } from "@/components/ui/empty-state";
import { Breadcrumb } from "@/components/site/breadcrumb";
import { formatDate } from "@/lib/format";

export function ContentPageBody({
  page,
  label,
}: {
  page: { title: string; body: string; updatedAt: Date } | null;
  label: string;
}) {
  return (
    <div className="container-page max-w-3xl py-10">
      <Breadcrumb items={[{ label: "Início", href: "/" }, { label }]} />
      {page ? (
        <>
          <h1 className="font-display text-3xl font-bold text-ink-900">{page.title}</h1>
          <p className="mt-1 text-xs text-ink-400">Última atualização em {formatDate(page.updatedAt)}</p>
          <div className="prose-content mt-6">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{page.body}</ReactMarkdown>
          </div>
        </>
      ) : (
        <EmptyState
          className="mt-6"
          title="Conteúdo ainda não configurado"
          description="Esta página institucional será preenchida em breve pelo administrador do site."
        />
      )}
    </div>
  );
}
