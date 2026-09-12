# VITRIVO

Vitrine de curadoria de produtos afiliados. O site **não vende diretamente**:
apresenta produtos selecionados, compara ofertas de marketplaces parceiros
(Shopee, Mercado Livre, TikTok Shop, Amazon, AliExpress e outros que venham a
ser cadastrados) e encaminha o visitante à oferta escolhida através de um
redirecionamento interno rastreado (`/sair/[offerId]`). A venda, cobrança,
nota fiscal, envio e pós-venda são sempre responsabilidade do marketplace.

> Consulte também `RELATORIO-DE-ENTREGA.md` para o resumo do que foi
> construído, testado e o que ainda depende do proprietário do projeto.

---

## Stack e decisões técnicas

| Camada | Escolha | Por quê |
|---|---|---|
| Framework | Next.js 15 (App Router) + React 19 + TypeScript | Moderno, SEO-friendly (Server Components), bem suportado na Vercel. **Next 16 foi avaliado e descartado**: acabara de ser lançado, com breaking changes ainda não documentados de forma madura. Next 14 foi descartado por já não receber mais patches de segurança (múltiplos CVEs sem correção na branch 14.2.x, incluindo um RCE não autenticado em Windows). Next 15.5.x é a linha estável mais recente ainda ativamente corrigida. |
| Estilo | Tailwind CSS v3 | Consistência de design system sem overhead de CSS-in-JS. |
| Banco de dados | SQLite (dev/local) via Prisma ORM | Zero-config, sem dependência de serviço externo pago para rodar localmente. O schema evita recursos exclusivos de um provedor (sem enums nativos, sem arrays) para migrar para PostgreSQL trocando apenas `provider` e `DATABASE_URL`. |
| ORM | Prisma **6.19.3** (fixado) | Prisma 7 (lançado recentemente) mudou radicalmente a configuração de datasource (exige `prisma.config.ts` + adapters), API ainda instável/pouco documentada. Prisma 6 é a última major estável com a API tradicional. |
| Autenticação admin | NextAuth.js (Credentials Provider) + bcrypt + JWT | Autenticação server-side real (não simulada no navegador), sessão via JWT assinado, sem necessidade de tabela de sessões. |
| Validação | Zod | Schemas compartilháveis entre formulários e serviços. |
| Testes unitários/integração | Vitest + Testing Library | Rápido, roda contra um banco SQLite de teste isolado (`prisma/test.db`). |
| Testes E2E | Playwright (Chromium, perfis desktop e mobile) | Cobre fluxo público e administrativo completo contra um build de produção isolado (`prisma/e2e.db`). |
| Ícones | lucide-react | Leve, sem ícones de marcas de terceiros (removidos da lib; ver `Footer`). |
| Markdown | react-markdown + remark-gfm | Descrição de produtos, guias e páginas institucionais aceitam Markdown. |

Todas essas escolhas são **reversíveis** e documentadas para facilitar upgrade
futuro (ex.: migrar para Postgres, atualizar para Next 16/Prisma 7 quando
essas versões amadurecerem).

---

## Estrutura do projeto

```
prisma/
  schema.prisma        # modelo de dados
  seed.ts               # dados de demonstração (marcados como fictícios)
  migrations/
scripts/
  create-admin.ts        # CLI para criar administrador
  seed-e2e-db.ts          # popula o banco usado pelos testes E2E
src/
  app/
    (public)/             # todas as páginas públicas (compartilham Header/Footer)
    admin/
      login/              # fora do guard de autenticação
      (protected)/         # dashboard, produtos, categorias, ofertas, conteúdos, analytics, configurações
    api/auth/[...nextauth]/
    sair/[offerId]/        # rota de redirecionamento afiliado rastreado
    sitemap.ts / robots.ts
  components/
    ui/                   # botão, badge, card, input, tabela, paginação, skeleton, empty/error state, confirmação destrutiva
    site/                 # header, footer, product-card, offer-list, breadcrumb, etc.
    admin/                # shell do painel, botão de logout
    analytics/            # scripts de pixels + trackers de página/produto/categoria/busca
  lib/
    services/             # regra de negócio + acesso a dados (products, offers, categories, marketplaces, analytics, content-pages, contact, admin-users, site-settings)
    validation/            # schemas Zod
    domain/publish-rules.ts # regras puras de publicação (testáveis sem banco)
    redirect/allowlist.ts  # validação de domínio/HTTPS do redirecionamento afiliado
    analytics/             # camada de analytics desacoplada (GA4, Meta Pixel, TikTok Pixel)
    auth.ts, session.ts, prisma.ts, rate-limit.ts, audit.ts, utm.ts, slug.ts
  config/
    site.ts               # configuração pública da marca (nome, cores via Tailwind, redes, pixels)
    env.ts                # validação tipada das variáveis de servidor
  middleware.ts            # protege /admin/* e captura UTMs
tests/
  unit/, integration/       # Vitest
  e2e/                      # Playwright
```

---

## Como rodar localmente

### 1. Pré-requisitos
- Node.js 20+ (usado nesta entrega: Node 24)
- npm

### 2. Instalar dependências
```bash
npm install
```

### 3. Configurar variáveis de ambiente
```bash
cp .env.example .env
```
Gere um `NEXTAUTH_SECRET` forte:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```
Cole o resultado em `NEXTAUTH_SECRET` no `.env`. As demais variáveis já têm
valores padrão utilizáveis em desenvolvimento — veja a seção
[Variáveis de ambiente](#variáveis-de-ambiente) para o significado de cada uma.

### 4. Banco de dados
```bash
npm run prisma:migrate   # cria/atualiza o schema em prisma/dev.db
npm run db:seed          # popula categorias, marketplaces, produtos e páginas de demonstração
```

O seed cria um administrador de demonstração:
- **e-mail:** `admin@vitrivo.local`
- **senha:** `TrocarSenha123`

> Troque essa senha (ou crie outro admin com `npm run admin:create`) antes de
> qualquer uso além do ambiente local.

### 5. Rodar em desenvolvimento
```bash
npm run dev
```
Acesse `http://localhost:3000` (site) e `http://localhost:3000/admin/login`
(painel administrativo).

### 6. Criar um administrador adicional (opcional)
```bash
npm run admin:create
# ou, não interativo:
npm run admin:create -- --name "Seu Nome" --email voce@exemplo.com --password "SenhaForte123"
```

---

## Variáveis de ambiente

Veja `.env.example` para a lista completa e comentada. Resumo:

| Variável | Obrigatória | Descrição |
|---|---|---|
| `DATABASE_URL` | sim | Conexão do Prisma. `file:./dev.db` em desenvolvimento. |
| `NEXTAUTH_SECRET` | sim | Chave de assinatura das sessões. **Gere um valor único por ambiente.** |
| `NEXTAUTH_URL` | produção | URL pública do site (necessária fora do localhost). |
| `NEXT_PUBLIC_SITE_NAME`, `..._SLOGAN`, `..._URL`, `..._CONTACT_EMAIL` | não | Identidade da marca — trocar aqui é o único passo necessário para rebrandear o site. |
| `NEXT_PUBLIC_SOCIAL_*` | não | Links de redes sociais exibidos no rodapé (ocultos se vazios). |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID`, `..._META_PIXEL_ID`, `..._TIKTOK_PIXEL_ID` | não | Pixels de analytics. O site funciona normalmente com todos vazios — nenhum script de terceiro é carregado nesse caso. |
| `NEXT_PUBLIC_FEATURE_GUIDES`, `..._NEWSLETTER` | não | Feature flags. |
| `REDIRECT_EXTRA_ALLOWED_HOSTS` | não | Reforço opcional de infraestrutura para a allowlist de redirecionamento (a allowlist principal fica no cadastro de cada marketplace, no painel). |

Nenhum segredo real deve existir no repositório. `.env` está no `.gitignore`.

---

## Configuração da marca (branding)

Toda a identidade visível (nome, slogan, e-mail, redes, textos do banner
inicial) é centralizada e substituível sem tocar em código:

1. **Nome, slogan, contato, redes sociais, pixels** → variáveis `NEXT_PUBLIC_*`
   no `.env` (veja acima). Exigem reiniciar a aplicação.
2. **Título/subtítulo do banner inicial e texto de curadoria** → editáveis em
   `/admin/configuracoes` (persistidos no banco, sem precisar de deploy).
3. **Cores** → tokens Tailwind em `tailwind.config.ts` (`brand`, `ink`,
   `accent`). Uma identidade neutra e premium já está aplicada; trocar a
   paleta é uma alteração isolada nesse arquivo.
4. **Páginas institucionais e legais** (Sobre, Política de Privacidade, Termos
   de Uso, Política de Cookies, Transparência de Afiliados) → editáveis em
   `/admin/conteudos`.
5. **Marketplaces e domínios permitidos para redirecionamento** →
   `/admin/ofertas`.

---

## Cadastro de marketplaces e ofertas

1. Em `/admin/ofertas`, cadastre o marketplace com os **domínios permitidos**
   (ex.: `shopee.com.br, s.shopee.com.br`). Só URLs de afiliado HTTPS
   pertencentes a esses domínios (ou subdomínios) são aceitas — isso é
   validado tanto ao salvar a oferta quanto no momento do clique, prevenindo
   redirecionamento aberto.
2. Em cada produto (`/admin/produtos/[id]`), adicione uma ou mais ofertas
   indicando o marketplace, a URL de afiliado, preço de referência (opcional)
   e qual é a oferta principal.
3. Trocar a oferta principal, adicionar/remover ofertas ou desativá-las
   **nunca altera a URL pública do produto** — a página fica em
   `/produto/[slug]` independentemente de quais marketplaces estão ativos.

---

## Rastreamento e analytics

- O clique de saída (`/sair/[offerId]`) é o evento central: a rota resolve a
  oferta no servidor, valida o destino contra a allowlist, registra o clique
  (produto, oferta, marketplace, dispositivo, UTM, referrer) e só então
  redireciona. Nenhuma URL arbitrária é aceita por query string.
- UTMs de campanha (`utm_source`, `utm_medium`, `utm_campaign`, `utm_content`,
  `utm_term`) são capturados pelo middleware em um cookie de primeira parte
  (30 dias) e anexados ao clique quando o visitante sai pelo link de afiliado.
- Google Analytics, Meta Pixel e TikTok Pixel são adaptadores independentes
  (`src/lib/analytics/adapters`) — cada um só carrega/dispara se o respectivo
  ID estiver configurado. Com tudo vazio, nenhum script de terceiro é
  injetado e o site funciona normalmente.
- `/admin/analytics` mostra cliques por produto, marketplace, campanha e
  origem, com exportação em CSV.

---

## Segurança implementada

- Login administrativo **server-side** (NextAuth Credentials + bcrypt),
  sessão JWT assinada por `NEXTAUTH_SECRET`.
- Rate limiting de tentativas de login (5 tentativas / 15 min por IP+e-mail).
  **Limitação conhecida:** o limitador é em memória, por processo — adequado
  para uma instância única; em deploy com múltiplas instâncias/serverless
  concorrente, substitua por um armazenamento compartilhado (ex.: Upstash
  Redis) antes de expor o login publicamente em produção de alto tráfego.
- Middleware bloqueia qualquer rota `/admin/*` (exceto `/admin/login`) sem
  sessão válida.
- Redirecionamento de afiliado nunca aceita destino arbitrário: só resolve
  por `offerId` interno, valida HTTPS + allowlist de domínio por
  marketplace.
- Validação de entrada com Zod em todos os formulários e ações server-side.
- Segredos apenas em variáveis de ambiente; nenhuma chave real no
  repositório.
- Registro de auditoria (`AuditLog`) para ações administrativas relevantes
  (criação/publicação/arquivamento de produtos, mudanças de configuração).

**Pendências que exigem revisão antes de lançamento comercial real:**
- Os textos de Política de Privacidade, Termos de Uso e Política de Cookies
  gerados no seed são um **modelo inicial** e precisam de revisão jurídica
  profissional (isso está sinalizado no próprio texto de cada página).
- Adequação formal à LGPD (base legal, DPO, etc.) depende de decisão do
  proprietário do negócio.

---

## Testes

```bash
npm run lint        # ESLint
npm run typecheck   # tsc --noEmit
npm test            # Vitest (unitários + integração, banco de teste isolado)
npm run test:e2e    # Playwright (build de produção + banco de teste isolado)
npm run build       # build de produção
```

- **Unitários** (`tests/unit`): slugs, normalização de UTM, allowlist de
  redirecionamento (incluindo tentativas de open redirect), regras de
  publicação, validação Zod, rate limiting.
- **Integração** (`tests/integration`): roda contra `prisma/test.db` (isolado
  do banco de desenvolvimento). Cobre autenticação de admin, CRUD e
  publicação de produtos, allowlist de ofertas ponta a ponta, registro e
  agregação de cliques.
- **E2E** (`tests/e2e`): builda a aplicação e sobe em `prisma/e2e.db`
  (isolado). Cobre o fluxo público (busca, catálogo, produto, clique
  rastreado, 404, páginas legais) e o fluxo administrativo completo
  (login → categoria → produto → mídia → duas ofertas → publicar → conferir
  no site → trocar oferta principal sem mudar a URL → arquivar → confirmar
  remoção da listagem pública), em viewports desktop e mobile.

Ver `RELATORIO-DE-ENTREGA.md` para o resultado real da última execução.

---

## Build e deploy

```bash
npm run build
npm start
```

A aplicação está pronta para deploy na Vercel:
1. Trocar `DATABASE_URL` para um Postgres gerenciado (Vercel Postgres, Neon,
   Supabase) e `provider = "postgresql"` em `prisma/schema.prisma`.
2. Rodar `npx prisma migrate deploy` no pipeline de deploy.
3. Configurar as variáveis de ambiente do projeto na Vercel (mesmas do
   `.env.example`, com valores reais).
4. Criar o primeiro administrador em produção com `npm run admin:create`
   (ou uma migration de dados equivalente).

**Nenhum deploy foi realizado nesta entrega** — isso depende de autorização
explícita do proprietário, conforme instruído.

---

## Backup e manutenção

- Banco SQLite local: basta copiar o arquivo `prisma/dev.db`.
- Banco Postgres em produção: usar o backup gerenciado do provedor
  (Vercel Postgres/Neon/Supabase já oferecem backups automáticos).
- Migrations ficam versionadas em `prisma/migrations` — sempre rodar
  `prisma migrate deploy` (nunca `db push`) em produção.
- Auditoria de alterações administrativas fica na tabela `audit_logs`.

---

## Manual rápido do painel

1. **Login:** `/admin/login`.
2. **Dashboard:** contagens de produtos por status, ofertas ativas, cliques
   dos últimos 30 dias, mensagens não lidas e atividade recente.
3. **Produtos:** criar, editar, duplicar, destacar, publicar/arquivar/voltar
   a rascunho. Publicar exige título, resumo, descrição e ao menos uma
   oferta ativa — o botão fica desabilitado com o motivo explicado até isso
   ser satisfeito.
4. **Dentro de um produto:** mídia (imagens/vídeos por URL), ofertas
   (múltiplas, com oferta principal, ativar/desativar, marcar como
   verificado, reordenar, excluir).
5. **Categorias e tags:** criar/editar/excluir (categoria só pode ser
   excluída sem produtos vinculados).
6. **Ofertas e marketplaces:** cadastro dos marketplaces e seus domínios
   permitidos; visão geral de todas as ofertas do site.
7. **Conteúdos:** páginas institucionais/legais e guias editoriais
   (Markdown).
8. **Analytics:** cliques agregados por produto/marketplace/campanha/origem,
   exportação CSV.
9. **Configurações:** texto do banner inicial, referência somente-leitura da
   identidade da marca (vinda do `.env`) e mensagens recebidas pelo
   formulário de contato.

---

## Itens substituíveis quando nome, domínio, identidade e IDs afiliados forem definidos

- Nome/slogan/URL/e-mail/redes sociais → variáveis `NEXT_PUBLIC_*`.
- Paleta de cores → `tailwind.config.ts`.
- Pixels de analytics → variáveis `NEXT_PUBLIC_*` (vazio = desativado).
- Marketplaces e domínios permitidos → `/admin/ofertas`.
- Conteúdo institucional/legal → `/admin/conteudos`.
- Banner inicial e texto de curadoria → `/admin/configuracoes`.
- Produtos, categorias e tags de demonstração → substituir pelos reais no
  painel (os de demonstração estão marcados com a tag "Demonstração").

## Decisões de produto em aberto (dependem do proprietário)

- Nome definitivo da marca, domínio e nicho inicial.
- Identidade visual definitiva (a atual é neutra/premium e facilmente
  trocável).
- Quais programas de afiliados serão efetivamente contratados e seus termos
  vigentes (mídia paga, uso de marca, cookies, atribuição).
- Revisão jurídica profissional dos textos legais.
- Ferramenta definitiva de analytics além do rastreamento interno.
- Banco/hospedagem definitivos de produção (Postgres gerenciado + Vercel são
  o caminho recomendado nesta entrega, mas a decisão final é do proprietário).
