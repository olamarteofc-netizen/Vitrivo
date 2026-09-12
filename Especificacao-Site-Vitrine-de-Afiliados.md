# ESPECIFICAÇÃO DO SITE — VITRINE DE AFILIADOS

## 1. Resultado esperado

Aplicação web completa, responsiva e pronta para produção, construída como uma vitrine independente de produtos afiliados. A operação deverá conseguir trocar nome, domínio, identidade, pixels e marketplaces sem reconstruir o sistema.

O primeiro lançamento não terá checkout, carrinho nem conta de cliente. A conversão principal será o clique rastreado para uma oferta externa.

## 2. Perfis

### Visitante

- navega pela home e categorias;
- pesquisa e filtra produtos;
- abre páginas de produto;
- compara ofertas disponíveis;
- clica em “Ver produto”;
- é avisado de que será direcionado ao parceiro;
- acessa páginas institucionais e legais.

### Administrador

- autentica-se em área protegida;
- gerencia produtos, categorias, tags e ofertas;
- organiza destaques;
- administra conteúdo e configurações não sensíveis;
- consulta métricas de clique;
- pré-visualiza antes de publicar.

## 3. Mapa de páginas

### Públicas

- `/` — início.
- `/produtos` — catálogo.
- `/produto/[slug]` — produto.
- `/categoria/[slug]` — categoria.
- `/buscar` — busca.
- `/guias` e `/guias/[slug]` — preparados para conteúdo editorial.
- `/sobre` — sobre.
- `/contato` — contato.
- `/politica-de-privacidade`.
- `/termos-de-uso`.
- `/politica-de-cookies`.
- `/transparencia-de-afiliados`.
- `/sair/[offerId]` — registra clique e redireciona com segurança.
- página 404 e tratamento de erro.

### Administrativas

- `/admin/login`.
- `/admin` — dashboard.
- `/admin/produtos`.
- `/admin/produtos/novo`.
- `/admin/produtos/[id]`.
- `/admin/categorias`.
- `/admin/ofertas`.
- `/admin/conteudos`.
- `/admin/analytics`.
- `/admin/configuracoes`.

## 4. Home

- cabeçalho com logo provisória, navegação, pesquisa e menu móvel;
- hero configurável sem alegações não comprovadas;
- produtos em destaque;
- categorias principais;
- seção de tendências/novidades;
- bloco explicando a curadoria;
- conteúdo editorial futuro;
- aviso de afiliado discreto e claro;
- rodapé completo.

## 5. Catálogo e busca

- grid responsivo;
- paginação ou carregamento progressivo acessível;
- filtro por categoria, marketplace e faixa de preço de referência;
- ordenação por destaque, recentes e popularidade interna;
- estado sem resultados;
- URLs de filtro compartilháveis quando viável;
- cards com imagem, nome, resumo, preço de referência opcional, marketplaces disponíveis e CTA.

## 6. Produto

- galeria de imagens/vídeo;
- breadcrumb;
- título e resumo;
- conteúdo em blocos;
- benefícios, funcionamento e especificações;
- avisos;
- área “Onde comprar”;
- uma oferta principal e outras alternativas;
- marketplace, preço de referência, condição e última verificação;
- CTA rastreado;
- aviso de variação de preço/estoque;
- divulgação de afiliado;
- produtos relacionados;
- compartilhamento;
- metadados e schema coerentes com os dados reais.

## 7. Modelo de dados sugerido

### AdminUser

- id, name, email, passwordHash, role, active, createdAt, updatedAt, lastLoginAt.

### Product

- id, title, slug, shortDescription, description, status, categoryId, featured, seoTitle, seoDescription, publishedAt, createdAt, updatedAt.

### ProductMedia

- id, productId, type, url, altText, position.

### Category

- id, name, slug, description, imageUrl, active, position.

### Tag e ProductTag

- relacionamento entre produtos e tags.

### Marketplace

- id, name, slug, logoUrl, active, disclosureText.

### Offer

- id, productId, marketplaceId, destinationUrl, affiliateUrl, referencePrice, currency, label, notes, primary, active, position, lastCheckedAt, createdAt, updatedAt.

### OutboundClick

- id, offerId, productId, occurredAt, sessionId anonimizado, referrer, landingPath, utmSource, utmMedium, utmCampaign, utmContent, utmTerm, deviceClass.

### SiteSetting

- key, value, type, public, updatedAt.

### ContentPage

- id, slug, title, body, status, seoTitle, seoDescription, updatedAt.

### AuditLog

- id, adminUserId, action, entityType, entityId, metadata segura, createdAt.

## 8. Regras para links afiliados

- Somente administradores podem cadastrar destinos.
- Validar protocolo HTTPS e domínio permitido.
- Usar allowlist configurável de marketplaces.
- O identificador da oferta deve ser resolvido server-side.
- A rota pública nunca deve aceitar uma URL arbitrária como destino.
- Registrar clique antes do redirecionamento sem atrasar perceptivelmente a navegação.
- Preservar parâmetros afiliados autorizados.
- Não fazer cloaking proibido nem alterar links em desacordo com o programa.
- Permitir desativar imediatamente uma oferta.

## 9. Configuração

Criar configuração tipada e central para identidade e recursos públicos. Usar variáveis de ambiente para banco, autenticação, armazenamento, analytics e demais segredos.

Fornecer `.env.example` completo, sem valores reais.

## 10. Stack e engenharia

Se o repositório já existir, respeitar sua stack e padrões antes de alterar dependências. Se começar do zero, usar uma stack web moderna, estável, compatível com Vercel e bem suportada pelo Claude Code, preferencialmente TypeScript e renderização adequada a SEO.

Requisitos:

- separação entre UI, domínio, persistência e integrações;
- componentes reutilizáveis;
- validação compartilhada de dados;
- migrations versionadas;
- seed de demonstração claramente marcado como fictício;
- banco preparado para produção;
- tratamento de erros e logs sem expor segredos;
- lint, checagem de tipos, testes e build;
- documentação.

## 11. Design system

- mobile-first;
- identidade provisória centralizada;
- tipografia legível;
- contraste WCAG razoável;
- estados de foco visíveis;
- espaçamentos consistentes;
- componentes: botão, link, card, badge, input, select, modal, toast, tabela, paginação, skeleton, empty state, error state e confirmação destrutiva;
- experiência administrativa simples e objetiva.

## 12. Analytics e privacidade

- camada própria de eventos para não acoplar a aplicação a um fornecedor;
- adaptadores configuráveis para GA, Meta Pixel e TikTok Pixel;
- nenhuma chave real no código;
- impedir eventos duplicados quando possível;
- documentar nomes e payloads dos eventos;
- respeitar consentimento quando juridicamente necessário;
- anonimizar ou minimizar identificadores internos.

## 13. Testes obrigatórios

### Unitários

- validações;
- criação de slugs;
- regras de publicação;
- allowlist de destinos;
- construção segura de redirecionamento;
- normalização de UTMs.

### Integração

- CRUD de produto;
- CRUD e ordenação de ofertas;
- autenticação e autorização;
- publicação/arquivamento;
- registro do clique;
- redirecionamento para oferta ativa;
- bloqueio de oferta inativa ou destino inválido.

### E2E

- visitante encontra produto e abre oferta;
- administrador entra, cria produto, adiciona oferta, publica e confirma exibição;
- administrador troca a oferta principal sem alterar a URL do produto;
- layout móvel e desktop;
- páginas legais e 404.

### Qualidade

- lint;
- typecheck;
- testes;
- build de produção;
- auditoria básica de acessibilidade;
- conferência de metadados, sitemap e robots;
- ausência de segredos no repositório.

## 14. Entrega

- aplicação funcional;
- migrations e seed demonstrativo;
- `.env.example`;
- README com instalação, desenvolvimento, teste, build e deploy;
- manual curto do painel;
- inventário das configurações substituíveis;
- relatório final de testes executados;
- lista explícita de decisões que ainda dependem do proprietário.

