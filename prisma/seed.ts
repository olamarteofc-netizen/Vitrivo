/**
 * Seed de demonstração — VITRIVO
 *
 * Todos os produtos criados aqui são FICTÍCIOS (marcados com a tag
 * "Demonstração") e existem apenas para permitir testar a aplicação antes do
 * cadastro dos produtos reais. Nenhuma marca, preço ou avaliação aqui deve
 * ser tratada como dado real.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { MARKETPLACE_BOOTSTRAP } from "../src/lib/domain/marketplace-bootstrap";
import { CATEGORY_BOOTSTRAP, TAG_BOOTSTRAP } from "../src/lib/domain/catalog-bootstrap";

const prisma = new PrismaClient();

const DEMO_ADMIN_EMAIL = "admin@vitrivo.local";
const DEMO_ADMIN_PASSWORD = "TrocarSenha123";

async function main() {
  // ---------------------------------------------------------------------
  // Administrador de demonstração
  // ---------------------------------------------------------------------
  const existingAdmin = await prisma.adminUser.findUnique({ where: { email: DEMO_ADMIN_EMAIL } });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(DEMO_ADMIN_PASSWORD, 12);
    await prisma.adminUser.create({
      data: {
        name: "Administrador Demo",
        email: DEMO_ADMIN_EMAIL,
        passwordHash,
        role: "ADMIN",
      },
    });
    console.log(`\nAdmin de demonstração criado:\n  e-mail: ${DEMO_ADMIN_EMAIL}\n  senha:  ${DEMO_ADMIN_PASSWORD}\n  (troque esta senha ou crie outro admin antes de produção)\n`);
  }

  // ---------------------------------------------------------------------
  // Marketplaces (mesma fonte estrutural usada pela migration de bootstrap
  // em produção — ver src/lib/domain/marketplace-bootstrap.ts)
  // ---------------------------------------------------------------------
  const marketplaceDefs = MARKETPLACE_BOOTSTRAP.map((def) => ({
    name: def.name,
    slug: def.slug,
    allowedHosts: def.allowedHosts.join(","),
    disclosureText: def.disclosureText,
  }));
  const marketplaces = new Map<string, string>();
  for (const def of marketplaceDefs) {
    const mp = await prisma.marketplace.upsert({
      where: { slug: def.slug },
      update: {},
      create: def,
    });
    marketplaces.set(def.slug, mp.id);
  }

  // ---------------------------------------------------------------------
  // Categorias e tags estruturais reais (mesma fonte da migration de
  // bootstrap em produção — ver src/lib/domain/catalog-bootstrap.ts)
  // ---------------------------------------------------------------------
  for (const def of CATEGORY_BOOTSTRAP) {
    await prisma.category.upsert({
      where: { slug: def.slug },
      update: {},
      create: { name: def.name, slug: def.slug, position: def.position },
    });
  }
  for (const def of TAG_BOOTSTRAP) {
    await prisma.tag.upsert({ where: { slug: def.slug }, update: {}, create: { name: def.name, slug: def.slug } });
  }

  // ---------------------------------------------------------------------
  // Categorias de demonstração (usadas apenas pelos produtos fictícios
  // abaixo — não confundir com as categorias reais criadas acima)
  // ---------------------------------------------------------------------
  const categoryDefs = [
    { name: "Wellness", slug: "wellness", description: "Bem-estar e autocuidado no dia a dia.", position: 0 },
    { name: "Beauty", slug: "beauty", description: "Beleza e cuidados pessoais.", position: 1 },
    { name: "Home", slug: "home", description: "Organização, cozinha e conforto para casa.", position: 2 },
    { name: "Pets", slug: "pets", description: "Produtos para cães, gatos e outros pets.", position: 3 },
    { name: "Tech", slug: "tech", description: "Gadgets e acessórios inteligentes selecionados.", position: 4 },
  ];
  const categories = new Map<string, string>();
  for (const def of categoryDefs) {
    const cat = await prisma.category.upsert({ where: { slug: def.slug }, update: {}, create: def });
    categories.set(def.slug, cat.id);
  }

  // ---------------------------------------------------------------------
  // Tags
  // ---------------------------------------------------------------------
  const tagDefs = ["Demonstração", "Compacto", "Portátil", "Presente", "Organização", "Silicone"];
  const tags = new Map<string, string>();
  for (const name of tagDefs) {
    const slug = name
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase();
    const tag = await prisma.tag.upsert({ where: { slug }, update: {}, create: { name, slug } });
    tags.set(name, tag.id);
  }

  const img = (seed: string) => `https://placehold.co/800x800/1E483C/F1F8F5?text=${encodeURIComponent(seed)}`;

  type ProductSeed = {
    title: string;
    slug: string;
    shortDescription: string;
    description: string;
    benefits: string[];
    specifications: { label: string; value: string }[];
    warnings?: string;
    categorySlug: string;
    tags: string[];
    featured: boolean;
    status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
    offers: {
      marketplaceSlug: string;
      referencePrice: number;
      isPrimary: boolean;
      label?: string;
    }[];
  };

  const productDefs: ProductSeed[] = [
    {
      title: "Difusor de Aromas Compacto",
      slug: "difusor-de-aromas-compacto",
      shortDescription: "Difusor ultrassônico silencioso para ambientes pequenos.",
      description:
        "Um difusor de aromas compacto pensado para mesas de trabalho e quartos pequenos. Funciona por ultrassom, sem calor, preservando as propriedades dos óleos essenciais.\n\nIdeal para quem busca criar um ambiente mais calmo em casa ou no escritório.",
      benefits: ["Funcionamento silencioso", "Desligamento automático", "Luz noturna com 3 tons"],
      specifications: [
        { label: "Capacidade do reservatório", value: "200 ml" },
        { label: "Autonomia aproximada", value: "6 a 8 horas" },
        { label: "Alimentação", value: "USB 5V" },
      ],
      categorySlug: "wellness",
      tags: ["Demonstração", "Compacto"],
      featured: true,
      status: "PUBLISHED",
      offers: [
        { marketplaceSlug: "shopee", referencePrice: 79.9, isPrimary: true, label: "Frete grátis em compras selecionadas" },
        { marketplaceSlug: "mercado-livre", referencePrice: 84.9, isPrimary: false },
      ],
    },
    {
      title: "Organizador de Gavetas Modular",
      slug: "organizador-de-gavetas-modular",
      shortDescription: "Kit de divisórias ajustáveis para organizar gavetas de qualquer tamanho.",
      description:
        "Kit modular de divisórias plásticas que se encaixam e se ajustam a diferentes tamanhos de gaveta. Ótimo para cozinha, banheiro ou escritório.",
      benefits: ["Peças ajustáveis", "Fácil de higienizar", "Encaixe sem ferramentas"],
      specifications: [
        { label: "Material", value: "Plástico ABS" },
        { label: "Quantidade de peças", value: "8 unidades" },
      ],
      categorySlug: "home",
      tags: ["Demonstração", "Organização"],
      featured: true,
      status: "PUBLISHED",
      offers: [{ marketplaceSlug: "mercado-livre", referencePrice: 59.9, isPrimary: true }],
    },
    {
      title: "Escova Facial de Silicone",
      slug: "escova-facial-de-silicone",
      shortDescription: "Escova de limpeza facial em silicone hipoalergênico, uso diário.",
      description:
        "Escova de silicone para limpeza facial suave, indicada para uso diário antes da rotina de skincare. As cerdas de silicone são fáceis de higienizar e duram mais que cerdas convencionais.",
      benefits: ["Silicone hipoalergênico", "Fácil de higienizar", "Uso diário"],
      specifications: [{ label: "Material", value: "Silicone grau alimentício" }],
      warnings: "Não substitui recomendação dermatológica. Interrompa o uso em caso de irritação.",
      categorySlug: "beauty",
      tags: ["Demonstração", "Silicone"],
      featured: false,
      status: "PUBLISHED",
      offers: [
        { marketplaceSlug: "shopee", referencePrice: 34.9, isPrimary: true },
        { marketplaceSlug: "tiktok-shop", referencePrice: 32.9, isPrimary: false },
      ],
    },
    {
      title: "Comedouro Elevado para Pets",
      slug: "comedouro-elevado-para-pets",
      shortDescription: "Comedouro elevado ajustável, mais conforto na hora da refeição.",
      description:
        "Comedouro elevado com altura ajustável em três níveis, feito para reduzir o esforço do pescoço de cães e gatos durante a alimentação.",
      benefits: ["Altura ajustável em 3 níveis", "Base antiderrapante", "Tigelas removíveis para lavar"],
      specifications: [
        { label: "Material da base", value: "Bambu laminado" },
        { label: "Material das tigelas", value: "Aço inoxidável" },
      ],
      categorySlug: "pets",
      tags: ["Demonstração"],
      featured: true,
      status: "PUBLISHED",
      offers: [{ marketplaceSlug: "amazon", referencePrice: 129.9, isPrimary: true }],
    },
    {
      title: "Mini Luminária LED com Clipe",
      slug: "mini-luminaria-led-com-clipe",
      shortDescription: "Luminária de LED recarregável com clipe para mesa ou notebook.",
      description:
        "Luminária compacta com clipe, três temperaturas de luz e recarga via USB-C. Ideal para leitura ou trabalho noturno.",
      benefits: ["3 temperaturas de luz", "Recarga via USB-C", "Clipe ajustável"],
      specifications: [
        { label: "Bateria", value: "1000 mAh" },
        { label: "Tempo de recarga", value: "~2 horas" },
      ],
      categorySlug: "tech",
      tags: ["Demonstração", "Portátil", "Presente"],
      featured: false,
      status: "PUBLISHED",
      offers: [{ marketplaceSlug: "shopee", referencePrice: 45.0, isPrimary: true }],
    },
    {
      title: "Garrafa Térmica Inteligente",
      slug: "garrafa-termica-inteligente",
      shortDescription: "Garrafa térmica com lembrete de hidratação (produto em avaliação).",
      description: "Produto em fase de avaliação de fornecedor — ainda não publicado no catálogo público.",
      benefits: ["Mantém temperatura por até 12h"],
      specifications: [{ label: "Capacidade", value: "500 ml" }],
      categorySlug: "wellness",
      tags: ["Demonstração"],
      featured: false,
      status: "DRAFT",
      offers: [{ marketplaceSlug: "mercado-livre", referencePrice: 99.9, isPrimary: true }],
    },
    {
      title: "Suporte Ajustável para Notebook (descontinuado)",
      slug: "suporte-ajustavel-para-notebook",
      shortDescription: "Produto de exemplo arquivado — não aparece nas listagens públicas.",
      description: "Este produto de demonstração foi arquivado para exemplificar o fluxo de arquivamento no painel.",
      benefits: ["Altura ajustável"],
      specifications: [{ label: "Material", value: "Alumínio" }],
      categorySlug: "tech",
      tags: ["Demonstração"],
      featured: false,
      status: "ARCHIVED",
      offers: [{ marketplaceSlug: "amazon", referencePrice: 89.9, isPrimary: true }],
    },
  ];

  for (const def of productDefs) {
    const existing = await prisma.product.findUnique({ where: { slug: def.slug } });
    if (existing) continue;

    const product = await prisma.product.create({
      data: {
        title: def.title,
        slug: def.slug,
        shortDescription: def.shortDescription,
        description: def.description,
        benefits: JSON.stringify(def.benefits),
        specifications: JSON.stringify(def.specifications),
        warnings: def.warnings,
        categoryId: categories.get(def.categorySlug),
        featured: def.featured,
        status: def.status,
        publishedAt: def.status === "PUBLISHED" ? new Date() : null,
      },
    });

    await prisma.productMedia.create({
      data: { productId: product.id, type: "IMAGE", url: img(def.title), altText: def.title, position: 0 },
    });

    for (const tagName of def.tags) {
      const tagId = tags.get(tagName);
      if (tagId) await prisma.productTag.create({ data: { productId: product.id, tagId } });
    }

    for (const [index, offerDef] of def.offers.entries()) {
      const marketplaceId = marketplaces.get(offerDef.marketplaceSlug);
      if (!marketplaceId) continue;
      const marketplace = marketplaceDefs.find((m) => m.slug === offerDef.marketplaceSlug)!;
      const host = marketplace.allowedHosts.split(",")[0];
      await prisma.offer.create({
        data: {
          productId: product.id,
          marketplaceId,
          destinationUrl: `https://${host}/produto-demo-${product.slug}`,
          affiliateUrl: `https://${host}/produto-demo-${product.slug}?afiliado=vitrivo-demo`,
          referencePrice: offerDef.referencePrice,
          currency: "BRL",
          label: offerDef.label,
          isPrimary: offerDef.isPrimary,
          active: true,
          position: index,
          lastCheckedAt: new Date(),
        },
      });
    }
  }

  // ---------------------------------------------------------------------
  // Páginas institucionais e legais (modelo inicial — revisar juridicamente)
  // ---------------------------------------------------------------------
  const legalNote =
    "> Este texto é um modelo inicial gerado para a primeira versão do site e deve ser revisado por um profissional jurídico antes do lançamento comercial.\n\n";

  const contentPages = [
    {
      slug: "sobre",
      title: "Sobre",
      type: "PAGE",
      body:
        "## Quem somos\n\nSomos uma vitrine independente de curadoria de produtos. Não vendemos diretamente: selecionamos produtos disponíveis em marketplaces parceiros e te levamos até a melhor oferta.\n\n## Como escolhemos os produtos\n\nAvaliamos reputação do vendedor, disponibilidade, avaliações públicas no marketplace de origem e potencial de utilidade real antes de publicar qualquer produto.\n\n## Modelo de negócio\n\nQuando você compra através de um dos nossos links, podemos receber uma comissão do marketplace parceiro — isso não altera o preço que você paga.",
    },
    {
      slug: "politica-de-privacidade",
      title: "Política de Privacidade",
      type: "PAGE",
      body:
        legalNote +
        "## Dados que coletamos\n\nColetamos o mínimo necessário para o funcionamento do site: dados técnicos de navegação (como página visitada e parâmetros de campanha), e os dados que você preenche voluntariamente no formulário de contato (nome, e-mail e mensagem).\n\n## Cookies\n\nUtilizamos cookies próprios para lembrar a origem da sua visita (parâmetros de campanha) e, quando configurado, cookies de terceiros de analytics. Veja detalhes na Política de Cookies.\n\n## Compartilhamento\n\nNão vendemos seus dados pessoais. Dados de navegação agregados podem ser usados para medir desempenho de campanhas.\n\n## Seus direitos (LGPD)\n\nVocê pode solicitar acesso, correção ou exclusão dos dados que nos forneceu diretamente através da nossa página de Contato.",
    },
    {
      slug: "termos-de-uso",
      title: "Termos de Uso",
      type: "PAGE",
      body:
        legalNote +
        "## Natureza do serviço\n\nEste site é uma vitrine de curadoria e não realiza vendas diretas. Todas as compras são processadas integralmente pelo marketplace parceiro, que é responsável pela venda, cobrança, nota fiscal, envio, entrega, cancelamento e devolução.\n\n## Links de afiliado\n\nAo clicar em \"Ver produto\", você será redirecionado a um site parceiro através de um link que pode gerar comissão para nós, sem custo adicional para você.\n\n## Isenção de responsabilidade\n\nPreços, disponibilidade e condições exibidos aqui são referenciais e podem mudar no site do parceiro sem aviso prévio.",
    },
    {
      slug: "politica-de-cookies",
      title: "Política de Cookies",
      type: "PAGE",
      body:
        legalNote +
        "## O que são cookies\n\nPequenos arquivos usados para lembrar preferências e medir uso do site.\n\n## Cookies que usamos\n\n- Cookie técnico de atribuição de campanha (primeira parte, até 30 dias).\n- Cookie técnico de sessão de clique para afiliados (primeira parte, até 180 dias).\n- Cookies de analytics/pixels de terceiros, somente quando configurados pelo administrador do site.\n\n## Como gerenciar\n\nVocê pode bloquear cookies nas configurações do seu navegador a qualquer momento.",
    },
    {
      slug: "transparencia-de-afiliados",
      title: "Transparência de Afiliados",
      type: "PAGE",
      body:
        "## Como funciona\n\nEste site participa de programas de afiliados de marketplaces como Shopee, Mercado Livre, TikTok Shop e Amazon. Isso significa que podemos receber uma comissão quando você compra um produto através de um dos nossos links, sem qualquer custo extra para você.\n\n## Nossa curadoria é independente\n\nA seleção de produtos não é paga pelos marketplaces — escolhemos o que consideramos relevante e, quando disponível, comparamos ofertas entre diferentes parceiros.",
    },
    {
      slug: "guia-como-escolher-um-difusor-de-aromas",
      title: "Como escolher um difusor de aromas (guia de exemplo)",
      type: "GUIDE",
      seoDescription: "Guia de demonstração do formato editorial do site.",
      body:
        "Este é um conteúdo editorial de demonstração.\n\n## O que considerar\n\n- Capacidade do reservatório\n- Nível de ruído\n- Autonomia da bateria ou uso contínuo na tomada\n\nSubstitua este conteúdo por guias reais quando o catálogo definitivo estiver pronto.",
    },
  ];

  for (const page of contentPages) {
    await prisma.contentPage.upsert({
      where: { slug: page.slug },
      update: {},
      create: {
        slug: page.slug,
        title: page.title,
        body: page.body,
        type: page.type,
        status: "PUBLISHED",
        seoDescription: "seoDescription" in page ? page.seoDescription : undefined,
        publishedAt: new Date(),
      },
    });
  }

  console.log("Seed concluído.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
