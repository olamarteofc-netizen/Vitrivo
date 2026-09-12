import type { Metadata } from "next";
import Link from "next/link";
import { listPublishedGuides } from "@/lib/services/content-pages";
import { Breadcrumb } from "@/components/site/breadcrumb";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Guias",
  description: "Guias e comparativos para ajudar na escolha dos produtos.",
};

export default async function GuidesPage() {
  const guides = await listPublishedGuides();

  return (
    <div className="container-page py-10">
      <Breadcrumb items={[{ label: "Início", href: "/" }, { label: "Guias" }]} />
      <h1 className="font-display text-3xl font-bold text-ink-900">Guias e comparativos</h1>
      <p className="mt-2 max-w-2xl text-sm text-ink-500">
        Conteúdo editorial para ajudar você a escolher com mais confiança.
      </p>

      <div className="mt-8">
        {guides.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {guides.map((guide) => (
              <Link
                key={guide.id}
                href={`/guias/${guide.slug}`}
                className="rounded-2xl border border-border bg-surface p-5 transition-shadow hover:shadow-elevated"
              >
                <h2 className="font-display text-lg font-semibold text-ink-900">{guide.title}</h2>
                {guide.seoDescription && <p className="mt-2 text-sm text-ink-500">{guide.seoDescription}</p>}
                <p className="mt-3 text-xs text-ink-400">
                  Publicado em {formatDate(guide.publishedAt ?? guide.createdAt)}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Nenhum guia publicado ainda"
            description="Novos conteúdos editoriais aparecerão aqui em breve."
          />
        )}
      </div>
    </div>
  );
}
