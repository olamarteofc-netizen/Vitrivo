-- Bootstrap idempotente de dados estruturais obrigatórios de produção
-- (marketplaces, categorias e tags reais). NÃO é seed de demonstração:
-- roda em todo `prisma migrate deploy` (inclusive em produção) e nunca
-- sobrescreve edições feitas depois pelo admin, graças ao
-- ON CONFLICT (slug) DO NOTHING.
--
-- Fonte de verdade em TypeScript (mantenha em sincronia ao editar):
--   src/lib/domain/marketplace-bootstrap.ts
--   src/lib/domain/catalog-bootstrap.ts

-- Marketplaces essenciais
INSERT INTO "marketplaces" ("id", "name", "slug", "allowedHosts", "active", "disclosureText", "createdAt", "updatedAt")
VALUES
  ('mkt_mercado_livre', 'Mercado Livre', 'mercado-livre', 'mercadolivre.com.br,mercadolibre.com,meli.la', true, 'Compra processada e entregue pelo Mercado Livre.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('mkt_shopee', 'Shopee', 'shopee', 'shopee.com.br,s.shopee.com.br,shp.ee', true, 'Compra processada e entregue pela Shopee.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('mkt_tiktok_shop', 'TikTok Shop', 'tiktok-shop', 'tiktok.com,vt.tiktok.com,vm.tiktok.com', true, 'Compra processada pelo TikTok Shop.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('mkt_amazon', 'Amazon', 'amazon', 'amazon.com.br,amzn.to', true, 'Compra processada e entregue pela Amazon.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("slug") DO NOTHING;

-- Categorias reais iniciais
INSERT INTO "categories" ("id", "name", "slug", "active", "position", "createdAt", "updatedAt")
VALUES
  ('cat_casa', 'Casa', 'casa', true, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat_limpeza', 'Limpeza', 'limpeza', true, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat_organizacao', 'Organização', 'organizacao', true, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat_cozinha', 'Cozinha', 'cozinha', true, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat_tecnologia', 'Tecnologia', 'tecnologia', true, 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat_automotivo', 'Automotivo', 'automotivo', true, 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat_pets', 'Pets', 'pets', true, 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat_beleza', 'Beleza', 'beleza', true, 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat_bem_estar', 'Bem-estar', 'bem-estar', true, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("slug") DO NOTHING;

-- Tags reais iniciais
INSERT INTO "tags" ("id", "name", "slug", "createdAt")
VALUES
  ('tag_limpeza', 'Limpeza', 'limpeza', CURRENT_TIMESTAMP),
  ('tag_casa', 'Casa', 'casa', CURRENT_TIMESTAMP),
  ('tag_recarregavel', 'Recarregável', 'recarregavel', CURRENT_TIMESTAMP),
  ('tag_sem_fio', 'Sem fio', 'sem-fio', CURRENT_TIMESTAMP),
  ('tag_organizacao', 'Organização', 'organizacao', CURRENT_TIMESTAMP),
  ('tag_mais_vendidos', 'Mais vendidos', 'mais-vendidos', CURRENT_TIMESTAMP),
  ('tag_achados_vitrivo', 'Achados Vitrivo', 'achados-vitrivo', CURRENT_TIMESTAMP)
ON CONFLICT ("slug") DO NOTHING;
