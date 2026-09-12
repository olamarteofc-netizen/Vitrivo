import { notFound } from "next/navigation";
import { getContentPageById } from "@/lib/services/content-pages";
import { ConfirmSubmitButton } from "@/components/ui/confirm-submit-button";
import { ContentForm } from "../content-form";
import { updateContentPageAction, deleteContentPageAction } from "../actions";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const page = await getContentPageById(id);
  return { title: page ? page.title : "Conteúdo" };
}

export default async function EditContentPage({ params }: Props) {
  const { id } = await params;
  const page = await getContentPageById(id);
  if (!page) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-ink-900">{page.title}</h1>
        <form action={deleteContentPageAction.bind(null, page.id)}>
          <ConfirmSubmitButton
            confirmTitle="Excluir conteúdo"
            confirmDescription="Esta ação não pode ser desfeita."
            confirmLabel="Excluir"
          >
            Excluir
          </ConfirmSubmitButton>
        </form>
      </div>
      <div className="mt-6">
        <ContentForm
          action={updateContentPageAction.bind(null, page.id)}
          submitLabel="Salvar alterações"
          defaults={{
            title: page.title,
            slug: page.slug,
            body: page.body,
            type: page.type,
            status: page.status,
            seoTitle: page.seoTitle,
            seoDescription: page.seoDescription,
          }}
        />
      </div>
    </div>
  );
}
