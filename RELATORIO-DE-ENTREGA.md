# RELATÓRIO DE ENTREGA — VITRIVO (Fase 1: Fundação)

**Data:** 12/09/2026
**Fonte de verdade usada:** `Arquivo-Mestre-Projeto-Vitrine-de-Afiliados.md`,
`Especificacao-Site-Vitrine-de-Afiliados.md` e
`Comando-Definitivo-Claude-Code-Site-Afiliados.md` (lidos integralmente antes
de qualquer código).

---

## 1. O que foi construído

Aplicação web completa de vitrine/curadoria de produtos afiliados, sem
checkout, carrinho ou conta de cliente, com:

### Público
- `/` (home configurável), `/produtos` (catálogo com filtro por categoria,
  marketplace e ordenação), `/produto/[slug]`, `/categoria/[slug]`,
  `/buscar`, `/guias` e `/guias/[slug]` (estrutura editorial), `/sobre`,
  `/contato` (formulário funcional, sem depender de e-mail transacional
  externo), `/politica-de-privacidade`, `/termos-de-uso`,
  `/politica-de-cookies`, `/transparencia-de-afiliados`,
  `/sair/[offerId]` (redirecionamento rastreado e seguro),
  `/oferta-indisponivel`, 404 e error boundary customizados.
- SEO técnico: metadados únicos por página, Open Graph, `sitemap.xml` e
  `robots.txt` dinâmicos, canonical, dados estruturados (schema.org
  `Product`/`Organization`) só com dados reais cadastrados.
- Acessibilidade: skip-link, foco visível, navegação por teclado, contraste
  planejado na paleta, estados vazio/erro/carregando em toda listagem.

### Administrativo (`/admin`, protegido por login)
- Dashboard com indicadores reais (produtos por status, ofertas ativas,
  cliques dos últimos 30 dias, mensagens não lidas, atividade recente).
- CRUD completo de produtos (título, slug, resumo, descrição em Markdown,
  benefícios, como funciona, especificações, avisos, categoria, tags, SEO),
  com rascunho/publicado/arquivado, destaque, duplicação e pré-visualização
  (produto não publicado só é visível para o admin logado).
- Publicação bloqueada por regra de negócio explícita (testada) até existir
  ao menos uma oferta ativa — com o motivo exibido na tela.
- Mídia por produto (imagens/vídeos por URL, com reordenação e remoção).
- Múltiplas ofertas por produto: marketplace, URL de destino, URL de
  afiliado, preço de referência, moeda, rótulo, oferta principal,
  ativar/desativar, reordenar, marcar como verificado, excluir com
  confirmação.
- Categorias e tags (CRUD).
- Marketplaces com **allowlist de domínios configurável** por marketplace —
  base da segurança do redirecionamento.
- Conteúdos institucionais/legais e guias editoriais (Markdown).
- Analytics: cliques agregados por produto, marketplace, campanha (UTM) e
  origem, com exportação CSV.
- Configurações: textos editáveis do banner inicial, referência
  somente-leitura da identidade vinda do `.env`, e caixa de mensagens de
  contato recebidas.
- Confirmação obrigatória (modal `<dialog>` nativo) para toda ação
  destrutiva (arquivar produto, excluir oferta/categoria/marketplace/
  conteúdo).

### Arquitetura e infraestrutura transversal
- Configuração de marca 100% centralizada (`src/config/site.ts`) — nome,
  slogan, contato, redes, pixels e feature flags nunca hardcoded em
  componentes.
- Camada de domínio/persistência isolada em `src/lib/services/*`, separada
  da UI e das rotas.
- Redirecionamento de afiliado com allowlist por domínio + HTTPS obrigatório,
  validado tanto ao salvar a oferta quanto no momento do clique — sem
  redirecionamento aberto.
- Analytics desacoplado (`src/lib/analytics`), com adaptadores independentes
  para GA4, Meta Pixel e TikTok Pixel — todos opcionais, site funciona 100%
  com tudo vazio.
- Autenticação real server-side (NextAuth Credentials + bcrypt + JWT), com
  rate limiting de login.
- Auditoria de ações administrativas (`AuditLog`).
- Migrations Prisma versionadas + seed de demonstração explicitamente
  marcado como fictício (tag "Demonstração" em todos os produtos de
  exemplo).

## 2. Arquitetura escolhida e por quê

Ver `README.md` → seção "Stack e decisões técnicas" para a tabela completa
com justificativa de cada escolha, incluindo duas decisões técnicas
relevantes tomadas de forma autônoma:

1. **Next.js 15.5.25 em vez de 14 (obsoleto/sem patch) ou 16 (recém-lançado,
   API ainda instável).**
2. **Prisma 6.19.3 em vez de 7** (Prisma 7 exige `prisma.config.ts` +
   adapters, mudança recente e ainda pouco madura; 6.x é a última major
   estável com a API tradicional de `datasource url`).

Ambas reversíveis e documentadas.

## 3. Arquivos e diretórios importantes

Ver `README.md` → seção "Estrutura do projeto". Pontos de entrada
recomendados para revisão:
- `prisma/schema.prisma` — modelo de dados completo.
- `src/lib/redirect/allowlist.ts` + `src/app/sair/[offerId]/route.ts` —
  segurança do redirecionamento (o ponto mais sensível do sistema).
- `src/lib/domain/publish-rules.ts` — regra de publicação.
- `src/app/admin/(protected)/produtos/actions.ts` — Server Actions do CRUD
  de produtos/ofertas/mídia.
- `src/config/site.ts` e `.env.example` — tudo que é substituível.

## 4. Comandos executados nesta entrega (e resultado real)

```bash
npm install                 # dependências
npm run prisma:migrate      # migration inicial (prisma/migrations/20260912170236_init)
npm run db:seed             # seed de demonstração
npm run lint                # ESLint
npx tsc --noEmit             # typecheck
npm test                    # Vitest
npm run test:e2e            # Playwright
npm run build                # build de produção
```

### Lint
```
✔ No ESLint warnings or errors
```

### Typecheck
```
(sem saída = sem erros)
```

### Testes automatizados — Vitest (unitário + integração)
```
Test Files  10 passed (10)
     Tests  84 passed (84)
```
Cobrem: geração/unicidade de slugs, normalização e sanitização de UTM,
allowlist de redirecionamento (incluindo tentativas de open redirect via
userinfo/subdomínio falso), regras de publicação, validação Zod de
produto/oferta/marketplace/login, rate limiting, autenticação de admin
(hash de senha, credenciais inválidas, admin inativo), CRUD e publicação de
produtos com banco real, allowlist de ofertas ponta a ponta, registro e
agregação de cliques.

### Testes automatizados — Playwright (E2E, build de produção)
```
22 passed, 2 skipped (fluxo admin não roda no perfil mobile, por design)
```
Cobrem, em navegador real (Chromium, perfis desktop e mobile):
- Visitante encontra produto publicado, vê a oferta e o CTA aponta para a
  rota interna de redirecionamento.
- A rota `/sair/[offerId]` registra o clique e redireciona exatamente para o
  domínio validado; oferta inexistente cai em `/oferta-indisponivel` sem
  expor redirecionamento aberto.
- 404 real para produto e rota inexistentes; páginas legais acessíveis;
  busca e catálogo encontram o produto publicado.
- **Fluxo administrativo completo:** login → criar categoria → criar
  produto → adicionar mídia → cadastrar duas ofertas → publicar (bloqueado
  até haver oferta ativa) → produto aparece no catálogo público → trocar a
  oferta principal **confirmando que a URL do produto não muda** → arquivar
  → confirmar remoção da listagem pública.
- Acesso a `/admin` sem login redireciona para `/admin/login`.

### Build de produção
```
✓ Compiled successfully
✓ Generating static pages (28/28)
```
28 rotas geradas (estáticas onde possível, dinâmicas onde há dado
personalizado/sessão), middleware de 56.9 kB, sem erros.

### Teste manual do fluxo completo (navegador real, sessão interativa)
Executado manualmente além dos automatizados, incluindo: login → criação de
produto → mídia → duas ofertas (uma principal) → publicação → verificação no
site público com preço/CTA/disclosure corretos → clique real registrado em
`/admin/analytics` → arquivamento → confirmação de remoção da listagem e
banner de "pré-visualização" para admin logado. Um produto e uma mensagem de
teste criados durante essa validação foram removidos do banco ao final.

**Bug real encontrado e corrigido durante o teste manual:** um `loading.tsx`
global fazia o Next.js iniciar o streaming da resposta com status HTTP 200
antes de `notFound()` ser resolvido, então um produto arquivado/rascunho
respondia 200 em vez de 404 para visitantes sem sessão. Corrigido movendo o
`loading.tsx` para as páginas de listagem específicas (`/produtos`,
`/categoria/[slug]`, `/buscar`, `/guias`) em vez de aplicá-lo à árvore
inteira. Comportamento correto (404) confirmado depois via `curl` e coberto
por teste E2E automatizado.

## 5. Credenciais e acesso local (sem expor segredos)

- Painel administrativo: `http://localhost:3000/admin/login`
- Administrador de demonstração criado pelo seed:
  - e-mail: `admin@vitrivo.local`
  - senha: `TrocarSenha123`
  - **Troque esta senha (ou crie outro admin com `npm run admin:create`)
    antes de qualquer uso além do ambiente local.**
- `NEXTAUTH_SECRET` local foi gerado aleatoriamente pelo próprio processo de
  setup e vive apenas no `.env` local (não commitado, fora do repositório).

## 6. Pendências legítimas que dependem do proprietário

- Nome definitivo da marca, domínio e primeiro nicho (todos os "em aberto"
  do Arquivo Mestre foram respeitados — nada foi decidido no lugar do
  proprietário).
- Identidade visual definitiva (a atual é neutra, premium e 100%
  substitutível via `tailwind.config.ts` e `.env`).
- Revisão jurídica profissional dos textos de Política de Privacidade,
  Termos de Uso e Política de Cookies (o seed já inclui um aviso explícito
  disso no topo de cada página).
- Adesão formal aos programas de afiliados (Shopee, Mercado Livre, TikTok
  Shop, Amazon, AliExpress) e conferência das regras vigentes de cada um
  antes de qualquer campanha paga.
- Produtos, categorias e IDs de afiliado reais (os de demonstração estão
  marcados com a tag "Demonstração" e devem ser substituídos).
- Banco de produção definitivo (PostgreSQL gerenciado — Vercel Postgres,
  Neon ou Supabase) e deploy na Vercel — **nada disso foi executado nesta
  entrega**, conforme instrução de não realizar deploy nem contratar
  serviços pagos sem autorização.
- Ferramenta de analytics definitiva além do rastreamento interno (o site já
  suporta GA4/Meta Pixel/TikTok Pixel bastando preencher os IDs).

## 7. Itens substituíveis (checklist rápido)

| Item | Onde trocar |
|---|---|
| Nome, slogan, domínio, e-mail, redes sociais | `.env` (`NEXT_PUBLIC_*`) |
| Cores da identidade visual | `tailwind.config.ts` |
| Pixels de analytics | `.env` (vazio = desativado) |
| Marketplaces e domínios permitidos | `/admin/ofertas` |
| Conteúdo institucional/legal | `/admin/conteudos` |
| Banner inicial e texto de curadoria | `/admin/configuracoes` |
| Produtos/categorias/tags reais | `/admin/produtos` e `/admin/categorias` (remover os de demonstração) |

## 8. Critérios do Arquivo Mestre (seção 13) — status

- [x] Instala e executa sem erro
- [x] Build de produção conclui
- [x] Responsividade validada (Playwright desktop + mobile; revisão manual
      via browser)
- [x] Painel administrativo protegido (middleware + guard server-side)
- [x] CRUD de produtos, categorias e ofertas funciona
- [x] Publicação e arquivamento funcionam
- [x] Troca de marketplace/oferta principal não exige alteração da página
      (testado automaticamente)
- [x] Cliques registrados e redirecionados corretamente
- [x] Não existe redirecionamento aberto (allowlist testada, inclusive
      tentativas de bypass)
- [x] Configurações de marca e integrações centralizadas
- [x] SEO técnico básico presente
- [x] Páginas legais e aviso de afiliado existem
- [x] Estados de loading, erro, vazio e sucesso tratados
- [x] Testes automatizados essenciais passam (84 unit/integração + 22 E2E)
- [x] Fluxo completo testado manualmente em desktop e (via emulação) celular
- [x] Documentação de instalação, configuração, administração e deploy
      atualizada (`README.md`)
- [x] Sem segredos reais no código
- [x] Sem erros críticos, dados falsos apresentados como reais, ou tarefas
      escondidas em comentários — dados de demonstração claramente marcados
