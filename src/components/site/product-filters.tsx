import { Select } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

export type FilterOptions = {
  categories: { slug: string; name: string }[];
  marketplaces: { slug: string; name: string }[];
};

export function ProductFilters({
  options,
  current,
  action = "/produtos",
  showCategory = true,
}: {
  options: FilterOptions;
  current: {
    categoria?: string;
    marketplace?: string;
    ordenar?: string;
    q?: string;
  };
  action?: string;
  showCategory?: boolean;
}) {
  return (
    <form
      method="GET"
      action={action}
      className="grid grid-cols-2 gap-3 rounded-2xl border border-border bg-surface p-4 sm:grid-cols-4"
    >
      {current.q !== undefined && <input type="hidden" name="q" value={current.q} />}

      {showCategory && (
        <div className="col-span-2 sm:col-span-1">
          <label htmlFor="filtro-categoria" className="mb-1 block text-xs font-medium text-ink-600">
            Categoria
          </label>
          <Select id="filtro-categoria" name="categoria" defaultValue={current.categoria ?? ""}>
            <option value="">Todas</option>
            {options.categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
      )}

      <div className="col-span-2 sm:col-span-1">
        <label htmlFor="filtro-marketplace" className="mb-1 block text-xs font-medium text-ink-600">
          Marketplace
        </label>
        <Select id="filtro-marketplace" name="marketplace" defaultValue={current.marketplace ?? ""}>
          <option value="">Todos</option>
          {options.marketplaces.map((m) => (
            <option key={m.slug} value={m.slug}>
              {m.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="col-span-2 sm:col-span-1">
        <label htmlFor="filtro-ordenar" className="mb-1 block text-xs font-medium text-ink-600">
          Ordenar por
        </label>
        <Select id="filtro-ordenar" name="ordenar" defaultValue={current.ordenar ?? "destaque"}>
          <option value="destaque">Destaque</option>
          <option value="recentes">Mais recentes</option>
          <option value="populares">Mais populares</option>
        </Select>
      </div>

      <div className="col-span-2 flex items-end sm:col-span-1">
        <Button type="submit" className="w-full">
          Aplicar filtros
        </Button>
      </div>
    </form>
  );
}
