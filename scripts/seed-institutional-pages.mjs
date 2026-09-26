// Script de uso único: preenche as páginas institucionais (Sobre, Política de
// Privacidade, Termos de Uso, Política de Cookies, Transparência de
// Afiliados) com conteúdo real, publicado. "Contato" fica de fora de
// propósito — o Richardy ainda vai criar um e-mail para centralizar a
// LamarteShop.
//
// Conteúdo é um rascunho honesto e genérico, sem inventar CNPJ, endereço ou
// dado que não exista. Vale revisão jurídica antes de tráfego pago em
// escala, como o próprio Arquivo Mestre já previa.
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const now = new Date();

const pages = [
  {
    id: "page_sobre",
    slug: "sobre",
    title: "Sobre a LamarteShop",
    body: `A LamarteShop é uma vitrine de curadoria de material de tatuagem: máquinas, tintas, agulhas, cartuchos, itens de biossegurança e tudo o que compõe o dia a dia de quem tatua.

Somos afiliados dos marketplaces onde os produtos são vendidos — Shopee e Mercado Livre. A LamarteShop não vende, não cobra e não entrega nenhum produto diretamente: cada página de produto leva você até a oferta no marketplace parceiro, onde a compra acontece com a segurança e as regras de compra, entrega, pagamento, cancelamento e devolução daquele marketplace.

A seleção de cada produto é feita por quem entende de tatuagem na prática — olhando reputação do vendedor, avaliações reais e a relação entre preço e confiança, nunca só o preço mais baixo.

A LamarteShop é um projeto de Richardy Lage, tatuador.

## Como escolhemos os produtos

- Reputação e avaliações do vendedor, não só o preço.
- Diversidade de marcas e variações dentro de cada categoria.
- Fotos e descrições oficiais do próprio fornecedor, sem inventar característica ou promessa que ele não declarou.`,
  },
  {
    id: "page_termos_de_uso",
    slug: "termos-de-uso",
    title: "Termos de Uso",
    body: `Ao usar o site da LamarteShop, você concorda com os termos abaixo.

## O que é a LamarteShop

A LamarteShop é um site de curadoria e divulgação de produtos de terceiros, vendidos em marketplaces parceiros (como Shopee e Mercado Livre). Não vendemos produtos diretamente, não processamos pagamentos e não realizamos entregas.

## Como funciona

Cada produto listado aqui tem um botão "Ver produto" que leva você até a oferta no marketplace parceiro. A compra, o pagamento, o prazo de entrega, a troca e a devolução são de responsabilidade exclusiva do marketplace e do vendedor onde a compra é realizada.

## Preços e disponibilidade

Preços, condições, estoque e disponibilidade podem mudar a qualquer momento no site do parceiro, sem aviso prévio nosso. As informações aqui são referências e podem estar desatualizadas no momento da sua visita.

## Comissão de afiliados

A LamarteShop participa de programas de afiliados dos marketplaces indicados. Podemos receber uma comissão quando você compra através de um dos nossos links, sem qualquer custo adicional para você. Veja mais na página de Transparência de Afiliados.

## Uso do site

Você concorda em usar o site apenas para fins lícitos, sem tentar acessar áreas restritas, extrair dados em massa (scraping) ou interferir no funcionamento do site.

## Responsabilidade

Não nos responsabilizamos por problemas em compras feitas em marketplaces parceiros, já que a relação de compra e venda acontece diretamente entre você e o vendedor.

## Alterações

Estes termos podem ser atualizados a qualquer momento. A data da última atualização aparece no topo desta página.`,
  },
  {
    id: "page_privacidade",
    slug: "politica-de-privacidade",
    title: "Política de Privacidade",
    body: `A LamarteShop respeita a sua privacidade. Esta página explica, de forma simples, quais dados coletamos e como usamos.

## O que coletamos

Coletamos o mínimo de dado necessário para o site funcionar: informações básicas de navegação (como páginas visitadas e cliques em ofertas), usadas para entender quais produtos fazem sentido no catálogo. Não pedimos cadastro, login ou dado de pagamento para navegar ou clicar em um produto — a compra em si acontece no site do marketplace parceiro, sob a política de privacidade dele.

## Cookies

Usamos cookies essenciais para o funcionamento do site. Veja detalhes na Política de Cookies.

## Compartilhamento

Não vendemos os seus dados. Compartilhamos o mínimo necessário com ferramentas de análise de tráfego, quando ativas, e com os marketplaces parceiros no momento em que você clica em "Ver produto" (para a comissão de afiliado ser corretamente atribuída).

## Seus direitos

De acordo com a Lei Geral de Proteção de Dados (LGPD), você pode pedir informação sobre os dados que temos sobre você, corrigi-los ou pedir a exclusão. Em breve, esta página trará um canal de contato oficial para esse tipo de pedido.

## Atualizações

Esta política pode mudar conforme o site evolui. A data no topo da página mostra a última atualização.`,
  },
  {
    id: "page_cookies",
    slug: "politica-de-cookies",
    title: "Política de Cookies",
    body: `Cookies são pequenos arquivos guardados no seu navegador para o site funcionar melhor.

## Cookies essenciais

Usamos cookies essenciais para o funcionamento básico do site, como lembrar preferências de navegação. Sem eles, algumas partes do site podem não funcionar corretamente.

## Cookies de análise

Quando ativos, cookies de análise nos ajudam a entender quais páginas e produtos têm mais interesse, de forma agregada. Hoje o site pode operar sem nenhum cookie de análise configurado.

## Cookies de afiliados

Ao clicar em "Ver produto", o marketplace parceiro pode gravar um cookie próprio para identificar que a visita veio da LamarteShop, permitindo a atribuição da comissão de afiliado. Esse cookie é do marketplace, não da LamarteShop, e segue a política de privacidade dele.

## Como gerenciar

Você pode bloquear ou apagar cookies a qualquer momento nas configurações do seu navegador. Isso pode afetar algumas funcionalidades do site.`,
  },
  {
    id: "page_transparencia_afiliados",
    slug: "transparencia-de-afiliados",
    title: "Transparência de Afiliados",
    body: `A LamarteShop é uma vitrine de curadoria: não vendemos os produtos que aparecem aqui. Cada produto é vendido por um vendedor real dentro de um marketplace parceiro (como Shopee ou Mercado Livre).

## Como ganhamos dinheiro

Participamos dos programas de afiliados desses marketplaces. Quando você clica em "Ver produto" e depois compra alguma coisa por lá, podemos receber uma comissão por essa venda — sem nenhum custo extra para você. O preço que você paga é o mesmo que pagaria entrando direto no marketplace.

## O que isso não muda

- Não recebemos comissão maior por indicar um produto pior.
- A escolha de cada produto segue nossos critérios de reputação do vendedor, avaliações reais e relação entre preço e confiança — nunca só quem paga mais comissão.
- Fotos, descrições e características de cada produto são as informações oficiais divulgadas pelo próprio vendedor no anúncio original. Não criamos promessa, benefício ou característica que o vendedor não declarou.

## Sua compra

A compra, o pagamento, a entrega, a troca e a devolução acontecem inteiramente dentro do marketplace parceiro, sob as regras e a proteção ao consumidor daquela plataforma — a LamarteShop não participa dessa etapa.`,
  },
];

for (const p of pages) {
  await prisma.contentPage.upsert({
    where: { slug: p.slug },
    update: {
      title: p.title,
      body: p.body,
      type: "PAGE",
      status: "PUBLISHED",
      publishedAt: now,
    },
    create: {
      id: p.id,
      slug: p.slug,
      title: p.title,
      body: p.body,
      type: "PAGE",
      status: "PUBLISHED",
      publishedAt: now,
    },
  });
  console.log("OK:", p.slug);
}

await prisma.$disconnect();
