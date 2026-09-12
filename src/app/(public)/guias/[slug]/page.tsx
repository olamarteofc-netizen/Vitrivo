import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getContentPageBySlug } from "@/lib/services/content-pages";
import { Breadcrumb } from "@/components/site/breadcrumb";
import { formatDate } from "@/lib/format";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = await getContentPageBySlug(slug);
  if (!guide || guide.type !== "GUIDE") return {};
  return {
    title: guide.seoTitle || guide.title,
    description: guide.seoDescription ?? undefined,
  };
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  const guide = await getContentPageBySlug(slug);
  if (!guide || guide.type !== "GUIDE" || guide.status !== "PUBLISHED") notFound();

  return (
    <div className="container-page max-w-3xl py-10">
      <Breadcrumb items={[{ label: "Início", href: "/" }, { label: "Guias", href: "/guias" }, { label: guide.title }]} />
      <h1 className="font-display text-3xl font-bold text-ink-900">{guide.title}</h1>
      <p className="mt-1 text-xs text-ink-400">
        Publicado em {formatDate(guide.publishedAt ?? guide.createdAt)}
      </p>
      <div className="prose-content mt-6">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{guide.body}</ReactMarkdown>
      </div>
    </div>
  );
}
