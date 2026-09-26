/**
 * Categorias e tags estruturais iniciais da LamarteShop — fonte única de verdade.
 *
 * Nicho redefinido em 26/09/2026: material de tatuagem (antes eram 9
 * categorias genéricas de "achados"). Ver decisão no cofre — Ink Tattoo Hack /
 * Vitrivo, 26/09/2026.
 *
 * Mesmo tratamento dado aos marketplaces (ver marketplace-bootstrap.ts):
 * aplicadas via migration idempotente (`ON CONFLICT (slug) DO NOTHING`), não
 * apenas via `prisma db seed`, para existirem em produção desde o primeiro
 * deploy sem depender de rodar o seed de demonstração.
 *
 * IMPORTANTE: como o ON CONFLICT só insere o que falta, mudar este arquivo não
 * atualiza sozinho categorias/tags que já tenham sido migradas para o banco.
 * Confirmar no Neon (schema desta app, org "Vercel: metamorphose tattoo",
 * projeto neon-aureolin-paddle) se a migration antiga já rodou antes de
 * assumir que o banco está igual a este arquivo.
 */

export type CategoryBootstrapDef = { id: string; slug: string; name: string; position: number };

// Nomes conferidos em 26/09/2026 contra o menu real da Electric Ink
// (electricink.com.br: Tatuagem > Tintas/Cartuchos/Agulhas/Bicos
// Descartáveis/Biossegurança; Cosméticos > Decalque/Cuidados Pós-Tattoo) e da
// Killer Ink (killerinktattoo.co.uk: Tattoo Ink/Machines/Cartridges/Needles/
// Tubes+Grips+Tips/Power Supplies/Hygiene and Aftercare) — não inventados.
export const CATEGORY_BOOTSTRAP: CategoryBootstrapDef[] = [
  { id: "cat_maquinas", slug: "maquinas", name: "Máquinas de Tatuagem", position: 0 },
  { id: "cat_cartuchos_agulhas", slug: "cartuchos-e-agulhas", name: "Cartuchos e Agulhas", position: 1 },
  { id: "cat_tintas", slug: "tintas-e-pigmentos", name: "Tintas e Pigmentos", position: 2 },
  { id: "cat_bicos_grips", slug: "bicos-grips-e-tubos", name: "Bicos, Grips e Tubos", position: 3 },
  { id: "cat_fontes", slug: "fontes-e-cabos", name: "Fontes e Cabos", position: 4 },
  { id: "cat_biosseguranca", slug: "biosseguranca", name: "Biossegurança", position: 5 },
  { id: "cat_cuidados", slug: "cuidados-pos-tattoo", name: "Cuidados Pós-Tattoo", position: 6 },
  { id: "cat_decalque", slug: "decalque-e-transfer", name: "Decalque e Transfer", position: 7 },
  { id: "cat_vestuario", slug: "vestuario-e-acessorios", name: "Vestuário e Acessórios", position: 8 },
];

export type TagBootstrapDef = { id: string; slug: string; name: string };

export const TAG_BOOTSTRAP: TagBootstrapDef[] = [
  { id: "tag_mais_vendidos", slug: "mais-vendidos", name: "Mais vendidos" },
  { id: "tag_lancamento", slug: "lancamento", name: "Lançamento" },
  { id: "tag_recarregavel", slug: "recarregavel", name: "Recarregável" },
  { id: "tag_sem_fio", slug: "sem-fio", name: "Sem fio" },
  { id: "tag_profissional", slug: "profissional", name: "Profissional" },
  { id: "tag_iniciante", slug: "iniciante", name: "Iniciante" },
  { id: "tag_recomendado", slug: "recomendado", name: "Recomendado LamarteShop" },
];
