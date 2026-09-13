/**
 * Categorias e tags estruturais iniciais da VITRIVO — fonte única de verdade.
 *
 * Mesmo tratamento dado aos marketplaces (ver marketplace-bootstrap.ts):
 * aplicadas via migration idempotente (`ON CONFLICT (slug) DO NOTHING`), não
 * apenas via `prisma db seed`, para existirem em produção desde o primeiro
 * deploy sem depender de rodar o seed de demonstração.
 */

export type CategoryBootstrapDef = { id: string; slug: string; name: string; position: number };

export const CATEGORY_BOOTSTRAP: CategoryBootstrapDef[] = [
  { id: "cat_casa", slug: "casa", name: "Casa", position: 0 },
  { id: "cat_limpeza", slug: "limpeza", name: "Limpeza", position: 1 },
  { id: "cat_organizacao", slug: "organizacao", name: "Organização", position: 2 },
  { id: "cat_cozinha", slug: "cozinha", name: "Cozinha", position: 3 },
  { id: "cat_tecnologia", slug: "tecnologia", name: "Tecnologia", position: 4 },
  { id: "cat_automotivo", slug: "automotivo", name: "Automotivo", position: 5 },
  { id: "cat_pets", slug: "pets", name: "Pets", position: 6 },
  { id: "cat_beleza", slug: "beleza", name: "Beleza", position: 7 },
  { id: "cat_bem_estar", slug: "bem-estar", name: "Bem-estar", position: 8 },
];

export type TagBootstrapDef = { id: string; slug: string; name: string };

export const TAG_BOOTSTRAP: TagBootstrapDef[] = [
  { id: "tag_limpeza", slug: "limpeza", name: "Limpeza" },
  { id: "tag_casa", slug: "casa", name: "Casa" },
  { id: "tag_recarregavel", slug: "recarregavel", name: "Recarregável" },
  { id: "tag_sem_fio", slug: "sem-fio", name: "Sem fio" },
  { id: "tag_organizacao", slug: "organizacao", name: "Organização" },
  { id: "tag_mais_vendidos", slug: "mais-vendidos", name: "Mais vendidos" },
  { id: "tag_achados_vitrivo", slug: "achados-vitrivo", name: "Achados Vitrivo" },
];
