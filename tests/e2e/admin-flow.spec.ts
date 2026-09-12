import { test, expect, type Page } from "@playwright/test";
import { E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD } from "./fixtures";

test.describe("Fluxo administrativo completo", () => {
  test.skip(({ isMobile }) => isMobile, "Painel administrativo é validado no viewport desktop");

  // Abre um <details> nativo diretamente via DOM em vez de clicar no
  // <summary>: depois de cada Server Action o React substitui o subtree
  // (Server Component) e o <details> volta a nascer fechado, o que cria uma
  // corrida entre o clique e o novo render. Definir `open` via evaluate após
  // o DOM já ter se estabilizado evita esse timing flakiness.
  async function openDetails(locator: import("@playwright/test").Locator) {
    await locator.evaluate((el) => {
      (el as HTMLDetailsElement).open = true;
    });
  }

  async function login(page: Page) {
    await page.goto("/admin/login");
    await page.getByLabel("E-mail").fill(E2E_ADMIN_EMAIL);
    await page.getByLabel("Senha").fill(E2E_ADMIN_PASSWORD);
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page).toHaveURL(/\/admin$/);
  }

  test("bloqueia acesso ao admin sem login", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("fluxo completo: categoria → produto → mídia → duas ofertas → publicar → conferir no site → trocar principal → arquivar", async ({
    page,
  }) => {
    const unique = Date.now();
    const categoryName = `Categoria E2E Fluxo ${unique}`;
    const productTitle = `Produto Fluxo Completo ${unique}`;

    await login(page);

    // 1. Criar categoria
    await page.goto("/admin/categorias");
    await page.getByLabel("Nome").first().fill(categoryName);
    await page.getByRole("button", { name: "Criar categoria" }).click();
    await expect(page.getByText(categoryName)).toBeVisible();

    // 2. Criar produto
    await page.goto("/admin/produtos/novo");
    await page.getByLabel("Título", { exact: true }).fill(productTitle);
    await page.getByLabel("Resumo curto").fill("Resumo do produto criado durante o teste E2E completo.");
    await page
      .getByLabel("Descrição completa")
      .fill("Descrição completa do produto criado durante o teste E2E completo do fluxo administrativo.");
    await page.getByRole("button", { name: "Criar produto" }).click();
    await expect(page).toHaveURL(/\/admin\/produtos\/[a-z0-9]+/);

    // Publicar deve estar bloqueado sem oferta ativa
    await expect(page.getByRole("button", { name: "Publicar" })).toBeDisabled();

    const productSlugText = await page.locator("p", { hasText: "/produto/" }).innerText();

    // 3. Adicionar mídia
    await page.getByLabel("URL", { exact: true }).fill("https://placehold.co/600x600?text=E2E");
    await page.getByRole("button", { name: "Adicionar mídia" }).click();
    await expect(page.locator("img").first()).toBeVisible();

    // 4. Cadastrar duas ofertas
    const addOfferForm = page.getByTestId("add-offer-form");
    const offerCards = page.getByTestId("offer-card");

    await openDetails(addOfferForm);
    await addOfferForm.getByLabel("Marketplace", { exact: true }).selectOption({ label: "Marketplace E2E" });
    await addOfferForm.getByLabel("URL do produto no marketplace").fill("https://loja-e2e-teste.com.br/produto-a");
    await addOfferForm
      .getByLabel("URL de afiliado (usada no redirecionamento)")
      .fill("https://loja-e2e-teste.com.br/produto-a?ref=1");
    await addOfferForm.getByLabel("Preço de referência (opcional)").fill("59.90");
    await addOfferForm.getByLabel("Oferta principal").check();
    await addOfferForm.getByRole("button", { name: "Adicionar oferta" }).click();

    await expect(offerCards).toHaveCount(1);

    await openDetails(addOfferForm);
    await addOfferForm.getByLabel("Marketplace", { exact: true }).selectOption({ label: "Marketplace E2E" });
    await addOfferForm.getByLabel("URL do produto no marketplace").fill("https://loja-e2e-teste.com.br/produto-b");
    await addOfferForm
      .getByLabel("URL de afiliado (usada no redirecionamento)")
      .fill("https://loja-e2e-teste.com.br/produto-b?ref=1");
    await addOfferForm.getByLabel("Preço de referência (opcional)").fill("69.90");
    await addOfferForm.getByRole("button", { name: "Adicionar oferta" }).click();

    await expect(offerCards).toHaveCount(2);

    // 5. Publicar
    await page.getByRole("button", { name: "Publicar" }).click();
    await expect(page.getByText("Publicado")).toBeVisible();

    const productId = page.url().split("/").pop()!.split("?")[0];

    // 6. Confirmar exibição pública
    await page.goto(`/produtos?q=${encodeURIComponent(productTitle)}`);
    await expect(page.getByText(productTitle)).toBeVisible();

    // 7. Trocar oferta principal e confirmar que a URL pública não muda
    await page.goto(`/admin/produtos/${productId}`);
    const secondOfferCard = offerCards.filter({ hasText: "R$ 69,90" });
    await secondOfferCard.getByRole("button", { name: "Definir como principal" }).click();
    await expect(secondOfferCard.getByText("Principal", { exact: true })).toBeVisible();

    const slugAfterChange = await page.locator("p", { hasText: "/produto/" }).innerText();
    expect(slugAfterChange).toBe(productSlugText);

    // 8. Arquivar e confirmar remoção da listagem pública
    await page.getByRole("button", { name: "Arquivar" }).first().click();
    await page.getByRole("dialog").getByRole("button", { name: "Arquivar" }).click();
    await expect(page.getByText("Arquivado")).toBeVisible();

    await page.goto(`/produtos?q=${encodeURIComponent(productTitle)}`);
    await expect(page.getByText(productTitle)).not.toBeVisible();
  });
});
