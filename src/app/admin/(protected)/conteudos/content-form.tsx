"use client";

import { useActionState } from "react";
import { Input, Textarea, Select, Label, FieldHint } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import type { ContentFormState } from "./actions";

type Defaults = {
  title: string;
  slug: string;
  body: string;
  type: string;
  status: string;
  seoTitle: string | null;
  seoDescription: string | null;
};

type Action = (state: ContentFormState, formData: FormData) => Promise<ContentFormState>;

export function ContentForm({
  action,
  defaults,
  submitLabel = "Salvar",
}: {
  action: Action;
  defaults?: Defaults;
  submitLabel?: string;
}) {
  const [state, formAction, pending] = useActionState(action, { status: "idle" } as ContentFormState);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="title">Título</Label>
          <Input id="title" name="title" required defaultValue={defaults?.title} />
        </div>
        <div>
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" name="slug" defaultValue={defaults?.slug} placeholder="gerado automaticamente" />
        </div>
        <div>
          <Label htmlFor="type">Tipo</Label>
          <Select id="type" name="type" defaultValue={defaults?.type ?? "PAGE"}>
            <option value="PAGE">Página institucional/legal</option>
            <option value="GUIDE">Guia (editorial)</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select id="status" name="status" defaultValue={defaults?.status ?? "DRAFT"}>
            <option value="DRAFT">Rascunho</option>
            <option value="PUBLISHED">Publicado</option>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="body">Conteúdo</Label>
        <Textarea id="body" name="body" required rows={14} defaultValue={defaults?.body} />
        <FieldHint>Aceita Markdown.</FieldHint>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="seoTitle">Título SEO (opcional)</Label>
          <Input id="seoTitle" name="seoTitle" maxLength={70} defaultValue={defaults?.seoTitle ?? ""} />
        </div>
        <div>
          <Label htmlFor="seoDescription">Descrição SEO (opcional)</Label>
          <Input id="seoDescription" name="seoDescription" maxLength={160} defaultValue={defaults?.seoDescription ?? ""} />
        </div>
      </div>

      {state.status === "error" && state.message && <p className="text-sm text-danger-600">{state.message}</p>}
      {state.status === "idle" && state.message && <p className="text-sm font-medium text-brand-700">{state.message}</p>}

      <Button type="submit" disabled={pending}>
        {pending ? "Salvando…" : submitLabel}
      </Button>
    </form>
  );
}
