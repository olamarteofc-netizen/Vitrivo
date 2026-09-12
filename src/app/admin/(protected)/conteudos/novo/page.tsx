import { ContentForm } from "../content-form";
import { createContentPageAction } from "../actions";

export const metadata = { title: "Novo conteúdo" };

export default function NewContentPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-2xl font-semibold text-ink-900">Novo conteúdo</h1>
      <div className="mt-6">
        <ContentForm action={createContentPageAction} submitLabel="Criar" />
      </div>
    </div>
  );
}
