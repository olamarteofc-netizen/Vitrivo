import { Plus, Trash2 } from "lucide-react";
import { listCategoriesAdmin } from "@/lib/services/categories";
import { listTags } from "@/lib/services/tags";
import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { Input, Textarea, Label, CheckboxField } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmSubmitButton } from "@/components/ui/confirm-submit-button";
import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
  createTagAction,
  deleteTagAction,
} from "./actions";

export const metadata = { title: "Categorias e tags" };

export default async function AdminCategoriesPage() {
  const [categories, tags] = await Promise.all([listCategoriesAdmin(), listTags()]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink-900">Categorias e tags</h1>
        <p className="mt-1 text-sm text-ink-500">Organize o catálogo público.</p>
      </div>

      <Card>
        <CardBody>
          <CardTitle>Nova categoria</CardTitle>
          <form action={createCategoryAction} className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="new-cat-name">Nome</Label>
              <Input id="new-cat-name" name="name" required />
            </div>
            <div>
              <Label htmlFor="new-cat-slug">Slug (opcional)</Label>
              <Input id="new-cat-slug" name="slug" />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="new-cat-description">Descrição (opcional)</Label>
              <Textarea id="new-cat-description" name="description" rows={2} />
            </div>
            <div>
              <Label htmlFor="new-cat-image">URL da imagem (opcional)</Label>
              <Input id="new-cat-image" name="imageUrl" type="url" />
            </div>
            <div>
              <Label htmlFor="new-cat-position">Posição</Label>
              <Input id="new-cat-position" name="position" type="number" defaultValue={categories.length} />
            </div>
            <div className="sm:col-span-2">
              <CheckboxField name="active" label="Ativa" defaultChecked />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit">
                <Plus className="h-4 w-4" />
                Criar categoria
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <div className="space-y-3">
        {categories.map((category) => (
          <Card key={category.id}>
            <CardBody>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-ink-900">{category.name}</span>
                  <Badge tone={category.active ? "brand" : "neutral"}>{category.active ? "Ativa" : "Inativa"}</Badge>
                  <span className="text-xs text-ink-400">{category._count.products} produto(s)</span>
                </div>
                <form action={deleteCategoryAction.bind(null, category.id)}>
                  <ConfirmSubmitButton
                    size="sm"
                    variant="ghost"
                    confirmTitle="Excluir categoria"
                    confirmDescription="Só é possível excluir categorias sem produtos vinculados."
                    confirmLabel="Excluir"
                  >
                    <Trash2 className="h-4 w-4" />
                  </ConfirmSubmitButton>
                </form>
              </div>
              <details className="mt-3">
                <summary className="cursor-pointer text-xs font-medium text-ink-500">Editar</summary>
                <form action={updateCategoryAction.bind(null, category.id)} className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label htmlFor={`cat-${category.id}-name`}>Nome</Label>
                    <Input id={`cat-${category.id}-name`} name="name" required defaultValue={category.name} />
                  </div>
                  <div>
                    <Label htmlFor={`cat-${category.id}-slug`}>Slug</Label>
                    <Input id={`cat-${category.id}-slug`} name="slug" defaultValue={category.slug} />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor={`cat-${category.id}-description`}>Descrição</Label>
                    <Textarea id={`cat-${category.id}-description`} name="description" rows={2} defaultValue={category.description ?? ""} />
                  </div>
                  <div>
                    <Label htmlFor={`cat-${category.id}-image`}>URL da imagem</Label>
                    <Input id={`cat-${category.id}-image`} name="imageUrl" type="url" defaultValue={category.imageUrl ?? ""} />
                  </div>
                  <div>
                    <Label htmlFor={`cat-${category.id}-position`}>Posição</Label>
                    <Input id={`cat-${category.id}-position`} name="position" type="number" defaultValue={category.position} />
                  </div>
                  <div className="sm:col-span-2">
                    <CheckboxField name="active" label="Ativa" defaultChecked={category.active} />
                  </div>
                  <div className="sm:col-span-2">
                    <Button type="submit" variant="outline" size="sm">
                      Salvar
                    </Button>
                  </div>
                </form>
              </details>
            </CardBody>
          </Card>
        ))}
      </div>

      <Card>
        <CardBody>
          <CardTitle>Tags</CardTitle>
          <form action={createTagAction} className="mt-4 flex gap-2">
            <Input name="name" placeholder="Nome da tag" required />
            <Button type="submit" variant="outline">
              Adicionar
            </Button>
          </form>
          <div className="mt-4 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <form key={tag.id} action={deleteTagAction.bind(null, tag.id)}>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-full bg-ink-100 px-3 py-1 text-sm text-ink-700 hover:bg-ink-200"
                  title="Remover tag"
                >
                  {tag.name} ({tag._count.products})
                  <Trash2 className="h-3 w-3" />
                </button>
              </form>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
