# COMANDO DEFINITIVO PARA O CLAUDE CODE

Copie e envie todo o conteúdo abaixo ao Claude Code quando ele estiver aberto na pasta destinada ao novo projeto.

---

Você será responsável por construir a primeira versão completa de um novo site de vitrine e curadoria de produtos afiliados. Trabalhe de forma autônoma, em blocos longos e econômicos, evitando perguntas técnicas desnecessárias, comandos repetidos e interrupções. Consulte o usuário apenas se surgir uma decisão de produto que mude materialmente o resultado, um risco relevante ou uma ação destrutiva.

## Objetivo comercial

O site NÃO venderá mercadorias diretamente. Não crie checkout, gateway de pagamento, carrinho ou conta de cliente nesta primeira versão.

O fluxo oficial é:

**anúncio/conteúdo → site próprio → página do produto → botão “Ver produto” → marketplace externo por link afiliado → compra no marketplace → comissão de afiliado.**

O site deve funcionar como uma curadoria premium e independente. Um mesmo produto poderá ter ofertas da Shopee, Mercado Livre, TikTok Shop, Amazon, AliExpress ou parceiros futuros. A marca nunca deverá ficar tecnicamente presa a um marketplace.

## Antes de escrever código

1. Inspecione completamente a pasta e identifique se existe repositório, aplicação, stack, instruções `AGENTS.md`, alterações não commitadas e convenções existentes.
2. Preserve todo trabalho existente e não sobrescreva mudanças do usuário.
3. Se houver aplicação válida, evolua a base atual. Se a pasta estiver vazia, inicialize uma aplicação moderna, estável, em TypeScript, adequada a SEO, banco de dados e deploy na Vercel.
4. Registre um plano curto e execute-o sem pedir confirmação técnica etapa por etapa.
5. Use versões estáveis e compatíveis entre si. Não atualize dependências existentes sem necessidade.

## Documentos oficiais

Considere como fonte de verdade os documentos entregues junto a este comando:

- `Arquivo-Mestre-Projeto-Vitrine-de-Afiliados.md`
- `Especificacao-Site-Vitrine-de-Afiliados.md`

Leia os dois integralmente antes da implementação. Em caso de conflito, o Arquivo Mestre tem prioridade. Não invente decisões definitivas para itens marcados como “em aberto”.

Se esses dois arquivos ainda não estiverem na pasta, não interrompa o trabalho: este comando contém os requisitos obrigatórios suficientes para a primeira versão. Registre no relatório que os documentos devem ser adicionados depois ao repositório e continue usando integralmente as regras abaixo.

## Arquitetura obrigatória

Implemente separação clara entre:

- interface;
- regras de domínio;
- persistência;
- autenticação;
- analytics;
- redirecionamento afiliado;
- configurações da marca;
- integrações externas.

Marca, domínio, cores, textos, pixels, IDs de programas e recursos habilitados devem ser substituíveis e centralizados. Segredos devem existir apenas em variáveis de ambiente server-side.

Crie `.env.example` documentado e sem credenciais reais.

Se precisar escolher banco/ORM/autenticação para um projeto vazio, priorize soluções maduras, tipadas, compatíveis com Vercel e fáceis de manter. Explique as escolhas no README. Não simule segurança com autenticação apenas no navegador.

## Páginas públicas

Implemente:

- `/`;
- `/produtos`;
- `/produto/[slug]`;
- `/categoria/[slug]`;
- `/buscar`;
- estrutura preparada para `/guias` e `/guias/[slug]`;
- `/sobre`;
- `/contato`;
- `/politica-de-privacidade`;
- `/termos-de-uso`;
- `/politica-de-cookies`;
- `/transparencia-de-afiliados`;
- `/sair/[offerId]` para registro e redirecionamento seguro;
- 404 e tratamento de erro.

## Área administrativa

Crie painel protegido com:

- login administrativo server-side;
- dashboard;
- CRUD completo de produtos;
- CRUD de categorias e tags;
- mídias de produto;
- múltiplas ofertas por produto;
- escolha e troca da oferta principal;
- ordenação e ativação/desativação de ofertas;
- rascunho, publicação e arquivamento;
- produtos em destaque;
- páginas institucionais editáveis quando seguro;
- configurações não sensíveis;
- visão de cliques por produto, marketplace, oferta e campanha;
- pré-visualização antes da publicação;
- confirmações para ações destrutivas.

## Produto e ofertas

Cada produto deverá aceitar título, slug, resumo, descrição, mídia, benefícios, funcionamento, especificações, avisos, categoria, tags, SEO, relacionados e status.

Cada oferta deverá aceitar marketplace, URL de destino/afiliado, preço de referência opcional, moeda, condição, observação, prioridade, status e data da última verificação.

Mostre uma área “Onde comprar”. O CTA padrão é **“Ver produto”**. Informe claramente que preço, disponibilidade e condições podem mudar no parceiro e que o site poderá receber comissão.

Nunca gere avaliações falsas, compradores falsos, descontos falsos, escassez artificial ou alegações médicas/comerciais não comprovadas. Dados de demonstração devem estar identificados como fictícios e nunca parecer dados reais em produção.

## Segurança do redirecionamento

A rota de saída deve receber apenas um identificador interno de oferta, buscar a oferta ativa no servidor, registrar o clique e redirecionar para o destino validado.

Não aceite URL arbitrária pela query string. Use HTTPS e allowlist configurável de domínios. Trate oferta inexistente, inativa ou inválida. Não faça cloaking que viole termos de programas afiliados.

## Rastreamento desacoplado

Crie uma camada própria de analytics com adaptadores configuráveis para:

- analytics interno de cliques;
- Google Analytics;
- Meta Pixel;
- TikTok Pixel;
- integração futura.

Implemente, quando configurados e permitidos, eventos de page view, busca, categoria, visualização de produto, clique em CTA, clique por oferta e compartilhamento. Capture UTMs de maneira responsável e evite duplicidade.

O site deve funcionar normalmente quando todos os pixels e IDs estiverem vazios.

## SEO, desempenho e experiência

- mobile-first;
- páginas rápidas e indexáveis;
- metadados únicos;
- canonical;
- sitemap;
- robots;
- Open Graph;
- dados estruturados somente com informações verdadeiras;
- imagens otimizadas;
- acessibilidade por teclado;
- contraste e foco visível;
- loading, skeleton, empty, error e success states;
- navegação móvel completa;
- design provisório premium, neutro e facilmente tematizável.

Evite aparência de template genérico, excesso de animações, banners agressivos e interfaces poluídas.

## Banco e conteúdo demonstrativo

Implemente migrations versionadas e seed mínimo para testar a aplicação. Inclua categorias e produtos demonstrativos claramente marcados como fictícios. Não use marcas, preços ou testemunhos inventados como se fossem reais.

## Testes e validação — obrigatórios

Não considere o trabalho concluído apenas porque as páginas abriram.

Implemente e execute:

1. lint;
2. checagem de tipos;
3. testes unitários das validações, slugs, allowlist, UTMs e redirecionamento;
4. testes de integração de autenticação, CRUD, publicação, ofertas e registro de cliques;
5. testes E2E do fluxo público e administrativo;
6. build de produção;
7. revisão responsiva em tamanhos representativos de celular e desktop;
8. revisão básica de acessibilidade;
9. verificação de SEO técnico;
10. busca por segredos, erros críticos, TODOs essenciais e conteúdo enganoso.

Teste manualmente o fluxo completo:

**login admin → criar categoria → criar produto → adicionar mídia → cadastrar duas ofertas → definir principal → pré-visualizar → publicar → localizar no site → abrir produto → clicar em cada oferta → confirmar registro do clique e redirecionamento → trocar oferta principal → confirmar que a URL do produto permaneceu igual → arquivar produto → confirmar remoção das listagens públicas.**

Se qualquer comando falhar, identifique a causa, corrija e execute novamente apenas o necessário. Não esconda testes falhando.

## Documentação obrigatória

Entregue:

- README completo;
- instruções de instalação e execução;
- variáveis de ambiente;
- banco, migration e seed;
- criação do primeiro administrador;
- uso do painel;
- configuração da marca;
- configuração futura do domínio;
- configuração de pixels;
- cadastro de marketplaces e links;
- testes e build;
- deploy na Vercel sem realizar publicação externa sem autorização;
- backup e manutenção básica.

Crie ao final um relatório `RELATORIO-DE-ENTREGA.md` com:

- o que foi construído;
- arquitetura escolhida;
- arquivos importantes;
- comandos executados;
- resultados reais de lint, typecheck, testes e build;
- pendências legítimas que dependem do proprietário;
- credenciais ou passos locais de acesso, sem expor segredos;
- lista de itens substituíveis quando nome, domínio, identidade, pixels e IDs afiliados forem definidos.

## Regras de autonomia e encerramento

- Não pare após criar somente a home.
- Não entregue telas estáticas onde CRUD, autenticação ou persistência foram exigidos.
- Não deixe funções principais simuladas sem informar.
- Não remova funcionalidades existentes para facilitar o build.
- Não faça deploy, compre domínio, crie contas, configure pixels reais ou use credenciais sem autorização específica.
- Não modifique projetos não relacionados.
- Preserve o histórico Git e faça commits pequenos e descritivos se o repositório e o fluxo do usuário permitirem.
- Tome decisões técnicas reversíveis autonomamente e documente-as.
- Só considere concluído quando os critérios do Arquivo Mestre e da Especificação estiverem satisfeitos e os testes tiverem sido realmente executados.

Comece agora pela inspeção do ambiente, leia integralmente os dois documentos oficiais, apresente o plano curto e siga trabalhando até concluir a primeira versão ou encontrar um bloqueio real que exija ação do proprietário.
