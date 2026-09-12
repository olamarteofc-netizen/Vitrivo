"use client";

import { useActionState } from "react";
import { Input, Textarea, Label, CheckboxField, FieldHint } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import type { MarketplaceFormState } from "./actions";

type Defaults = {
  name: string;
  slug: string;
  logoUrl: string | null;
  disclosureText: string | null;
  allowedHosts: string;
  active: boolean;
};

type Action = (state: MarketplaceFormState, formData: FormData) => Promise<MarketplaceFormState>;

export function MarketplaceForm({
  action,
  defaults,
  idPrefix,
  submitLabel = "Salvar",
}: {
  action: Action;
  defaults?: Defaults;
  idPrefix: string;
  submitLabel?: string;
}) {
  const [state, formAction, pending] = useActionState(action, { status: "idle" } as MarketplaceFormState);

  return (
    <form action={formAction} className="grid gap-3 sm:grid-cols-2">
      <div>
        <Label htmlFor={`${idPrefix}-name`}>Nome</Label>
        <Input id={`${idPrefix}-name`} name="name" required defaultValue={defaults?.name} />
      </div>
      <div>
        <Label htmlFor={`${idPrefix}-slug`}>Slug</Label>
        <Input id={`${idPrefix}-slug`} name="slug" defaultValue={defaults?.slug} />
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor={`${idPrefix}-allowedHosts`}>Domínios permitidos</Label>
        <Textarea
          id={`${idPrefix}-allowedHosts`}
          name="allowedHosts"
          rows={2}
          required
          defaultValue={defaults?.allowedHosts}
          placeholder="shopee.com.br, s.shopee.com.br"
        />
        <FieldHint>
          Separe por vírgula ou linha. Somente URLs de oferta com um destes domínios (ou subdomínios) serão aceitas.
        </FieldHint>
      </div>
      <div>
        <Label htmlFor={`${idPrefix}-logoUrl`}>URL do logo (opcional)</Label>
        <Input id={`${idPrefix}-logoUrl`} name="logoUrl" type="url" defaultValue={defaults?.logoUrl ?? ""} />
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor={`${idPrefix}-disclosureText`}>Texto de divulgação (opcional)</Label>
        <Textarea id={`${idPrefix}-disclosureText`} name="disclosureText" rows={2} defaultValue={defaults?.disclosureText ?? ""} />
        <FieldHint>Exibido na página do produto. Se vazio, usa o texto padrão do site.</FieldHint>
      </div>
      <div className="sm:col-span-2">
        <CheckboxField name="active" label="Ativo" defaultChecked={defaults?.active ?? true} />
      </div>
      {state.status === "error" && state.message && <p className="text-sm text-danger-600 sm:col-span-2">{state.message}</p>}
      {state.status === "idle" && state.message && (
        <p className="text-sm font-medium text-brand-700 sm:col-span-2">{state.message}</p>
      )}
      <div className="sm:col-span-2">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Salvando…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
