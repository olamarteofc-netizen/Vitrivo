"use client";

import { useActionState } from "react";
import { Input, Textarea, Select, Label, FieldError, FieldHint, CheckboxField } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import type { ProductFormState } from "./actions";
import { benefitsToText, specificationsToText } from "@/lib/parsing/product-text-fields";

type CategoryOption = { id: string; name: string };
type TagOption = { id: string; name: string };

export type ProductFormDefaults = {
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  benefits: string[];
  howItWorks: string | null;
  specifications: { label: string; value: string }[];
  warnings: string | null;
  categoryId: string | null;
  tagIds: string[];
  featured: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
};

type Action = (state: ProductFormState, formData: FormData) => Promise<ProductFormState>;

export function ProductForm({
  action,
  categories,
  tags,
  defaults,
  submitLabel = "Salvar",
}: {
  action: Action;
  categories: CategoryOption[];
  tags: TagOption[];
  defaults?: ProductFormDefaults;
  submitLabel?: string;
}) {
  const [state, formAction, pending] = useActionState(action, { status: "idle" } as ProductFormState);

  return (
    <form action={formAction} className="space-y-6">
      <Card>
        <CardBody className="space-y-4">
          <div>
            <Label htmlFor="title">Título</Label>
            <Input id="title" name="title" required defaultValue={defaults?.title} />
            <FieldError>{state.errors?.title}</FieldError>
          </div>

          <div>
            <Label htmlFor="slug">Slug (URL)</Label>
            <Input id="slug" name="slug" defaultValue={defaults?.slug} placeholder="gerado automaticamente" />
            <FieldHint>Deixe em branco para gerar a partir do título. Alterar o slug muda a URL pública.</FieldHint>
            <FieldError>{state.errors?.slug}</FieldError>
          </div>

          <div>
            <Label htmlFor="shortDescription">Resumo curto</Label>
            <Textarea id="shortDescription" name="shortDescription" required rows={2} defaultValue={defaults?.shortDescription} />
            <FieldError>{state.errors?.shortDescription}</FieldError>
          </div>

          <div>
            <Label htmlFor="description">Descrição completa</Label>
            <Textarea id="description" name="description" required rows={8} defaultValue={defaults?.description} />
            <FieldHint>Aceita Markdown (títulos com ##, listas com -, negrito com **texto**).</FieldHint>
            <FieldError>{state.errors?.description}</FieldError>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-4">
          <div>
            <Label htmlFor="benefitsText">Benefícios</Label>
            <Textarea
              id="benefitsText"
              name="benefitsText"
              rows={4}
              defaultValue={defaults ? benefitsToText(defaults.benefits) : ""}
            />
            <FieldHint>Um benefício por linha.</FieldHint>
          </div>

          <div>
            <Label htmlFor="howItWorks">Como funciona</Label>
            <Textarea id="howItWorks" name="howItWorks" rows={4} defaultValue={defaults?.howItWorks ?? ""} />
          </div>

          <div>
            <Label htmlFor="specificationsText">Especificações</Label>
            <Textarea
              id="specificationsText"
              name="specificationsText"
              rows={4}
              defaultValue={defaults ? specificationsToText(defaults.specifications) : ""}
            />
            <FieldHint>Um item por linha, no formato &quot;Rótulo: Valor&quot;. Ex.: Capacidade: 500 ml</FieldHint>
          </div>

          <div>
            <Label htmlFor="warnings">Avisos importantes</Label>
            <Textarea id="warnings" name="warnings" rows={3} defaultValue={defaults?.warnings ?? ""} />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-4">
          <div>
            <Label htmlFor="categoryId">Categoria</Label>
            <Select id="categoryId" name="categoryId" defaultValue={defaults?.categoryId ?? ""}>
              <option value="">Sem categoria</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>

          {tags.length > 0 && (
            <div>
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                {tags.map((tag) => (
                  <CheckboxField
                    key={tag.id}
                    name="tagIds"
                    value={tag.id}
                    label={tag.name}
                    defaultChecked={defaults?.tagIds.includes(tag.id)}
                  />
                ))}
              </div>
            </div>
          )}

          <CheckboxField name="featured" label="Produto em destaque" defaultChecked={defaults?.featured} />
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-4">
          <div>
            <Label htmlFor="seoTitle">Título para SEO (opcional)</Label>
            <Input id="seoTitle" name="seoTitle" maxLength={70} defaultValue={defaults?.seoTitle ?? ""} />
          </div>
          <div>
            <Label htmlFor="seoDescription">Descrição para SEO (opcional)</Label>
            <Textarea id="seoDescription" name="seoDescription" rows={2} maxLength={160} defaultValue={defaults?.seoDescription ?? ""} />
          </div>
        </CardBody>
      </Card>

      {state.status === "error" && state.message && <FieldError>{state.message}</FieldError>}
      {state.status === "idle" && state.message && (
        <p className="text-sm font-medium text-brand-700">{state.message}</p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "Salvando…" : submitLabel}
      </Button>
    </form>
  );
}
