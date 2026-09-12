import { listCategoriesAdmin } from "@/lib/services/categories";
import { listTags } from "@/lib/services/tags";
import { ProductForm } from "../product-form";
import { createProductAction } from "../actions";

export const metadata = { title: "Novo produto" };

export default async function NewProductPage() {
  const [categories, tags] = await Promise.all([listCategoriesAdmin(), listTags()]);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-2xl font-semibold text-ink-900">Novo produto</h1>
      <p className="mt-1 text-sm text-ink-500">
        Depois de criar o produto em rascunho, adicione mídias e ofertas antes de publicar.
      </p>
      <div className="mt-6">
        <ProductForm action={createProductAction} categories={categories} tags={tags} submitLabel="Criar produto" />
      </div>
    </div>
  );
}
